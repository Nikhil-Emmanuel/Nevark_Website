"""One-off generator for app icons and the social share image.

Run from the repo root:  python scripts/make-brand-assets.py
Outputs are committed, so this does not run during the Netlify build.
Replace with official artwork when a high-resolution logo is available.
"""
import io
from pathlib import Path
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "src/assets/fonts"


def load_font(woff2: str, size: int, wght: int | None = None):
    buf = io.BytesIO()
    f = TTFont(FONTS / woff2)
    f.flavor = None
    f.save(buf)
    buf.seek(0)
    font = ImageFont.truetype(buf, size)
    if wght is not None:
        try:
            font.set_variation_by_axes([wght])
        except Exception:
            pass
    return font


def vertical_gradient(w, h, top, bottom):
    g = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        g.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return g.resize((w, h))


def glow(size, color, radius, center, blur):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)
    return layer.filter(ImageFilter.GaussianBlur(blur))


def make_icon(px: int, out: Path, maskable=False):
    img = Image.new("RGBA", (px, px), (0, 0, 0, 255))
    img.alpha_composite(glow((px, px), (99, 102, 241, 120), int(px * 0.32), (px // 2, px // 2), px // 8))
    font = load_font("aquire.woff2", int(px * (0.52 if maskable else 0.62)))
    mask = Image.new("L", (px, px), 0)
    d = ImageDraw.Draw(mask)
    bbox = d.textbbox((0, 0), "N", font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((px - w) / 2 - bbox[0], (px - h) / 2 - bbox[1]), "N", font=font, fill=255)
    metal = vertical_gradient(px, px, (255, 255, 255), (150, 156, 170)).convert("RGBA")
    img.paste(metal, (0, 0), mask)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out, optimize=True)


def make_og(out: Path):
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    img.alpha_composite(glow((W, H), (79, 70, 229, 140), 300, (W // 2, H // 2), 120))
    img.alpha_composite(glow((W, H), (168, 85, 247, 90), 180, (W - 220, 140), 110))
    d = ImageDraw.Draw(img)
    title = load_font("aquire.woff2", 118)
    text = "N E V A R K"
    b = d.textbbox((0, 0), text, font=title)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], 210 - b[1]), text, font=title, fill=(255, 255, 255))
    sub = load_font("inter-latin-wght.woff2", 34, 500)
    line = "AI · Software · Industrial Engineering"
    b = d.textbbox((0, 0), line, font=sub)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], 380), line, font=sub, fill=(212, 212, 216))
    small = load_font("inter-latin-wght.woff2", 24, 400)
    tag = "Dream. Create. Innovate.   ·   nevark.in"
    b = d.textbbox((0, 0), tag, font=small)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], 470), tag, font=small, fill=(140, 146, 160))
    out.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out, quality=86, optimize=True, progressive=True)


if __name__ == "__main__":
    make_icon(180, ROOT / "src/static/apple-touch-icon.png")
    make_icon(192, ROOT / "src/assets/icons/icon-192.png")
    make_icon(512, ROOT / "src/assets/icons/icon-512.png")
    make_icon(512, ROOT / "src/assets/icons/icon-maskable-512.png", maskable=True)
    make_og(ROOT / "src/assets/og/nevark-og.jpg")
    print("done")
