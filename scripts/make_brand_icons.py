#!/usr/bin/env python3
"""Derive the app icon masters in assets/icons from the brand art in brand/.

    python3 scripts/make_brand_icons.py
    dart run flutter_launcher_icons
    dart run flutter_native_splash:create

brand/app-icon.png is the full-bleed icon; it is also the Android adaptive
foreground, which the launcher insets by 16%. brand/mark.png is the same mark
with more room around it, which keeps it inside the Android 12 splash safe
zone (the central two thirds).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
BRAND = REPO / "brand"
ICONS = REPO / "assets" / "icons"


def save(src: str, size: int, out: str) -> None:
    img = Image.open(BRAND / src).convert("RGB").resize((size, size), Image.LANCZOS)
    img.save(ICONS / out, optimize=True)
    print(f"{out}: {size}x{size} from brand/{src}")


def main() -> None:
    save("app-icon.png", 1024, "app_icon.png")
    save("mark.png", 1432, "app_icon_padded.png")


if __name__ == "__main__":
    main()
