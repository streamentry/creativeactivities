#!/usr/bin/env python3
"""Replace the small brand label above the headline in the store frames.

The approved frames in assets/screenshots/en-US/{iphone,ipad,android} carry
the old "Golden Moments" label baked into the image. This erases only that
label, filling it with the paper texture directly above it, and draws the new
label in the same colour, centre and size with Roboto Medium, the frames'
typeface. The app no longer ships Roboto, so pass its file with --font. The
headline, supporting text, bezel and capture are untouched.

Usage: python3 scripts/relabel_store_frames.py --font Roboto-Medium.ttf [--label TEXT] [--dry-run]
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'assets/screenshots/en-US'
FRAMES = ('01', '02', '03', '04', '05', '06')
LABEL_INK = (122, 90, 26)
# Search band for the label, as fractions of the frame: left, top, right, bottom.
BAND = (0.3, 0.02, 0.7, 0.06)
PAD = 14
OLD_LABEL = 'Golden Moments'


def label_box(image: Image.Image) -> tuple[int, int, int, int]:
    """Bounding box of the golden label ink inside the search band."""
    w, h = image.size
    left, top = int(w * BAND[0]), int(h * BAND[1])
    right, bottom = int(w * BAND[2]), int(h * BAND[3])
    px = np.asarray(image.crop((left, top, right, bottom)).convert('RGB')).astype(int)
    r, g, b = px[..., 0], px[..., 1], px[..., 2]
    ink = (r - b > 75) & (r < 170) & (g < 130)
    rows = np.nonzero(ink.sum(1) > 3)[0]
    cols = np.nonzero(ink.sum(0) > 2)[0]
    if rows.size == 0 or cols.size == 0:
        raise SystemExit('No label found in the search band.')
    return (left + cols.min(), top + rows.min(), left + cols.max() + 1, top + rows.max() + 1)


def erase(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    """Cover the label with the paper strip of the same height just above it."""
    x0, y0, x1, y1 = box[0] - PAD, box[1] - PAD, box[2] + PAD, box[3] + PAD
    height = y1 - y0
    if y0 - height < 0:
        raise SystemExit('Not enough paper above the label to cover it.')
    out = image.copy()
    out.paste(image.crop((x0, y0 - height, x1, y0)), (x0, y0))
    return out


def font_matching_width(font: Path, text: str, width: int) -> ImageFont.FreeTypeFont:
    """The Roboto Medium size at which text is drawn width pixels wide."""
    for size in range(12, 200):
        face = ImageFont.truetype(str(font), size)
        left, _, right, _ = face.getbbox(text)
        if right - left >= width:
            return face
    raise SystemExit(f'No font size reaches {width} pixels.')


def relabel(image: Image.Image, label: str, font: Path) -> Image.Image:
    box = label_box(image)
    # Same type size as the old label, measured by its drawn width.
    face = font_matching_width(font, OLD_LABEL, box[2] - box[0])
    out = erase(image.convert('RGB'), box)
    centre_x = image.size[0] / 2
    ImageDraw.Draw(out).text((centre_x, box[3]), label, font=face, fill=LABEL_INK, anchor='ms')
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font', type=Path, required=True)
    parser.add_argument('--label', default='Creative Activities')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    for device in ('iphone', 'ipad', 'android'):
        for name in FRAMES:
            path = SHOTS / device / f'{name}.jpg'
            image = Image.open(path)
            print(f'{path.relative_to(ROOT)}: label at {label_box(image)}')
            if not args.dry_run:
                relabel(image, args.label, args.font).save(path, 'JPEG', quality=90, optimize=True)


if __name__ == '__main__':
    main()
