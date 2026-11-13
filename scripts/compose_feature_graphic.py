#!/usr/bin/env python3
"""Build the Google Play feature graphic (1024 by 500) from approved store art.

Uses the same paper backdrop as the screenshot frames, the store name and
subtitle from metadata/app-store.en-US.json, and one unchanged native capture
(originals/android/02.png, matching with the demo photos) in a plain bezel.
No timer, score or move count appears. Roboto is the frames' typeface; the
app no longer ships it, so pass its folder with --fonts.

Usage: python3 scripts/compose_feature_graphic.py --fonts DIR
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'assets/screenshots/en-US'
METADATA = ROOT / 'metadata/app-store.en-US.json'
OUT = SHOTS / 'android/feature-graphic.png'

SIZE = (1024, 500)
INK = (32, 31, 29)
MUTED = (74, 70, 61)
BEZEL = (31, 31, 29)
BEZEL_WIDTH = 8
SCREEN_RADIUS = 30
TEXT_LEFT = 64


def backdrop() -> Image.Image:
    paper = Image.open(SHOTS / 'art/parchment-backdrop.png').convert('RGB')
    width, height = SIZE
    scaled = paper.resize((width, round(paper.height * width / paper.width)), Image.LANCZOS)
    top = (scaled.height - height) // 2
    return scaled.crop((0, top, width, top + height))


def rounded_mask(width: int, height: int, radius: int) -> Image.Image:
    big = Image.new('L', (width * 2, height * 2), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, width * 2 - 1, height * 2 - 1], radius=radius * 2, fill=255)
    return big.resize((width, height), Image.LANCZOS)


def place_phone(out: Image.Image, capture: Image.Image) -> None:
    """A phone showing the top of the capture, cut off by the bottom edge."""
    width = 300
    height = round(capture.height * width / capture.width)
    left, top = SIZE[0] - width - 90, 56
    outer = (width + 2 * BEZEL_WIDTH, height + 2 * BEZEL_WIDTH)
    out.paste(Image.new('RGB', outer, BEZEL), (left - BEZEL_WIDTH, top - BEZEL_WIDTH),
              rounded_mask(*outer, SCREEN_RADIUS + BEZEL_WIDTH))
    screen = capture.convert('RGB').resize((width, height), Image.LANCZOS)
    out.paste(screen, (left, top), rounded_mask(width, height, SCREEN_RADIUS))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fonts', type=Path, required=True)
    args = parser.parse_args()
    meta = json.loads(METADATA.read_text())

    def face(weight: str, size: int) -> ImageFont.FreeTypeFont:
        return ImageFont.truetype(str(args.fonts / f'Roboto-{weight}.ttf'), size)

    out = backdrop()
    place_phone(out, Image.open(SHOTS / 'originals/android/02.png'))
    draw = ImageDraw.Draw(out)
    title = face('Bold', 62)
    first, second = meta['name'].rsplit(' ', 1)
    draw.text((TEXT_LEFT, 150), first, font=title, fill=INK)
    draw.text((TEXT_LEFT, 222), second, font=title, fill=INK)
    draw.text((TEXT_LEFT, 316), meta['subtitle'], font=face('Regular', 34), fill=MUTED)
    out.save(OUT, 'PNG', optimize=True)
    print(f'Wrote {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
