#!/usr/bin/env python3
"""Generate PNG icons and Open Graph share images for the website.

macOS only: SVGs are rasterized with Quick Look (`qlmanage`), then composed
with Pillow. Run after `pnpm build` (it reads dist/pictures/*.svg), or pass a
folder of picture SVGs saved from `pnpm dev` (/pictures/<id>.svg):

    python3 scripts/make-images.py [pictures-dir]

Icons come from the brand art in ../brand (see LOGO.md). Outputs are committed
under public/icons, public/favicon.* and public/og.
"""

from __future__ import annotations

import base64
import io
import json
import re
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

SITE = Path(__file__).resolve().parent.parent
REPO = SITE.parent
DIST_PICS = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE / "dist" / "pictures"
PUBLIC = SITE / "public"
BRAND = REPO / "brand"
FONT_BOLD = REPO / "assets" / "fonts" / "AtkinsonHyperlegibleNext-Bold.ttf"
FONT_REG = REPO / "assets" / "fonts" / "AtkinsonHyperlegibleNext-Regular.ttf"
HOST = "creativeactivities.org"

# DESIGN.md tokens; BRAND_BG is the paper colour baked into the brand art.
CANVAS = (250, 248, 242)
BRAND_BG = (248, 246, 241)
INK = (36, 55, 47)
MUTED = (81, 99, 90)
TEAL = (23, 108, 101)
CLAY = (187, 108, 77)
SUN = (244, 205, 118)
PRINT_WHITE = (255, 255, 255)

W, H = 1200, 630


def rasterize(svg: Path, size: int, out_dir: Path) -> Image.Image:
    # Quick Look draws a fixed-size SVG at its intrinsic size; drop width and
    # height so the viewBox scales to fill the requested thumbnail.
    scalable = out_dir / svg.name
    text = svg.read_text()
    root_end = text.index(">") + 1
    root = re.sub(r'\s(width|height)="\d+"', "", text[:root_end])
    scalable.write_text(root + text[root_end:])
    svg = scalable
    subprocess.run(
        ["qlmanage", "-t", "-s", str(size), "-o", str(out_dir), str(svg)],
        check=True,
        capture_output=True,
    )
    png = out_dir / f"{svg.name}.png"
    img = Image.open(png).convert("RGBA")
    # Quick Look pads small intrinsic sizes with transparency; keep only the art.
    box = img.getbbox()
    if box:
        img = img.crop(box)
    return img.resize((size, size), Image.LANCZOS)


def print_card(pic: Image.Image, angle: float) -> Image.Image:
    border, bottom = 18, 40
    w = pic.width + border * 2
    h = pic.height + border + bottom
    card = Image.new("RGBA", (w, h), PRINT_WHITE + (255,))
    card.paste(pic, (border, border), pic)
    shadow = Image.new("RGBA", (w + 60, h + 60), (60, 44, 10, 0))
    ImageDraw.Draw(shadow).rectangle((30, 40, w + 30, h + 40), fill=(60, 44, 10, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    shadow.paste(card, (30, 30), card)
    return shadow.rotate(angle, expand=True, resample=Image.BICUBIC)


def cut_out(art: Image.Image) -> Image.Image:
    """The mark without its paper background, cropped to the shapes."""
    rgb = art.convert("RGB")
    # Distance from the paper colour becomes opacity: the grain stays below the
    # threshold, the pale torn edges keep a soft fringe.
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, BRAND_BG)).convert("L")
    alpha = diff.point(lambda v: 0 if v < 10 else min(255, (v - 10) * 12))
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out.crop(alpha.getbbox())


def background() -> Image.Image:
    img = Image.new("RGBA", (W, H), CANVAS + (255,))
    glow = Image.new("RGBA", (W, H), SUN + (0,))
    ImageDraw.Draw(glow).ellipse((620, -260, 1500, 420), fill=SUN + (110,))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.alpha_composite(glow)
    return img


def draw_text_block(img: Image.Image, mark: Image.Image, eyebrow: str, title: str, subtitle: str) -> None:
    d = ImageDraw.Draw(img)
    small = mark.copy()
    small.thumbnail((68, 68), Image.LANCZOS)
    img.alpha_composite(small, (64 + (68 - small.width) // 2, 54 + (68 - small.height) // 2))
    d.text((148, 60), "Creative Activities", font=ImageFont.truetype(str(FONT_BOLD), 34), fill=INK)
    d.text((148, 100), eyebrow, font=ImageFont.truetype(str(FONT_REG), 22), fill=MUTED)

    size = 64 if len(title) <= 40 else 54
    font = ImageFont.truetype(str(FONT_BOLD), size)
    lines = textwrap.wrap(title, width=18 if size == 64 else 22)[:4]
    y = 190
    for line in lines:
        d.text((64, y), line, font=font, fill=INK)
        y += int(size * 1.12)
    sub_font = ImageFont.truetype(str(FONT_REG), 28)
    for line in textwrap.wrap(subtitle, width=36)[:2]:
        y += 6
        d.text((64, y + 10), line, font=sub_font, fill=MUTED)
        y += 36
    d.rounded_rectangle((64, H - 76, 64 + 12, H - 64), radius=6, fill=CLAY)
    d.text((88, H - 86), HOST, font=ImageFont.truetype(str(FONT_BOLD), 26), fill=TEAL)


def compose(pics: list[Image.Image], mark: Image.Image, eyebrow: str, title: str, subtitle: str) -> Image.Image:
    img = background()
    spots = [(700, 70, -5.0), (930, 150, 4.0), (760, 330, 3.0)]
    for pic, (x, y, angle) in zip(pics, spots):
        card = print_card(pic.resize((200, 200), Image.LANCZOS), angle)
        img.alpha_composite(card, (x, y))
    draw_text_block(img, mark, eyebrow, title, subtitle)
    return img.convert("RGB")


def main() -> int:
    if not DIST_PICS.exists():
        print("Run `pnpm build` first so dist/pictures exists.", file=sys.stderr)
        return 1
    games = json.loads((SITE / "scripts" / "og-games.json").read_text())
    (PUBLIC / "icons").mkdir(parents=True, exist_ok=True)
    (PUBLIC / "og" / "games").mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        # The app icon already carries its own margin, so icons use it full bleed.
        app_icon = Image.open(BRAND / "app-icon.png").convert("RGB")
        for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
            app_icon.resize((size, size), Image.LANCZOS).save(PUBLIC / "icons" / name, optimize=True)
        app_icon.resize((48, 48), Image.LANCZOS).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
        # favicon.svg wraps a PNG of the cut-out mark so tabs show the shapes, not a tile.
        mark = cut_out(Image.open(BRAND / "mark.png"))
        fav = mark.copy()
        fav.thumbnail((192, 192), Image.LANCZOS)
        tile = Image.new("RGBA", (192, 192), (0, 0, 0, 0))
        tile.alpha_composite(fav, ((192 - fav.width) // 2, (192 - fav.height) // 2))
        buf = io.BytesIO()
        tile.save(buf, "PNG", optimize=True)
        data = base64.b64encode(buf.getvalue()).decode()
        (PUBLIC / "favicon.svg").write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            'viewBox="0 0 192 192" width="192" height="192">'
            f'<image width="192" height="192" href="data:image/png;base64,{data}"/></svg>\n'
        )

        cache: dict[str, Image.Image] = {}

        def pic(pid: str) -> Image.Image:
            if pid not in cache:
                cache[pid] = rasterize(DIST_PICS / f"{pid}.svg", 400, tmpdir)
            return cache[pid]

        pages = [
            ("default", ["teacup", "sunflower", "dog"], "Free · No sign-up · No timers",
             "Gentle Games & Activities for People with Dementia", "Simple picture games to enjoy together, at your own pace."),
            ("activities", ["watering-can", "bread", "tulip"], "Activity ideas",
             "Activities for People with Dementia", "Ideas for every stage, at home or in a group."),
            ("caregiving", ["kettle", "armchair", "lamp"], "For caregivers",
             "Practical Guides for Everyday Care", "Playing together, communication and caring for yourself."),
            ("brain-health", ["apple", "bicycle", "moon"], "Brain health",
             "What the Research Really Says", "Plain, sourced answers. General information, not medical advice."),
        ]
        for slug, ids, eyebrow, title, subtitle in pages:
            compose([pic(i) for i in ids], mark, eyebrow, title, subtitle).save(PUBLIC / "og" / f"{slug}.png", optimize=True)
        for g in games:
            compose([pic(i) for i in g["pictures"]], mark, "Free game · No timer or score", g["title"], g["subtitle"]).save(
                PUBLIC / "og" / "games" / f"{g['slug']}.png", optimize=True
            )
    print("Icons and share images written to public/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
