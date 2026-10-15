"""Generate 3 short FitAI Coach–themed hero sample videos (no external stock)."""
from __future__ import annotations

import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "uploads"
W, H = 1280, 720
FPS = 24
DURATION = 5.0
ORANGE = (255, 120, 0)
WHITE = (255, 255, 255)
MUTED = (220, 220, 220)
BG = (10, 10, 10)


def font(size: int) -> ImageFont.ImageFont:
    for name in (
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ):
        try:
            return ImageFont.truetype(name, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_centered(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    fnt: ImageFont.ImageFont,
    fill: tuple[int, int, int],
) -> None:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, y), text, font=fnt, fill=fill)


def frame_base(t: float, accent_shift: float) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Diagonal energy bands (brand orange)
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    pulse = 0.35 + 0.2 * math.sin(t * 2.2 + accent_shift)
    y0 = int(H * (0.35 + 0.05 * math.sin(t + accent_shift)))
    bd.polygon(
        [
            (-80, y0),
            (W + 80, y0 - 90),
            (W + 80, y0 + 40),
            (-80, y0 + 130),
        ],
        fill=(255, 120, 0, int(90 + 80 * pulse)),
    )
    bd.polygon(
        [
            (-80, y0 + 70),
            (W + 80, y0 - 20),
            (W + 80, y0 + 70),
            (-80, y0 + 160),
        ],
        fill=(255, 143, 42, int(40 + 50 * pulse)),
    )
    img = Image.alpha_composite(img.convert("RGBA"), band).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Progress / training meter
    meter_w = int((W - 160) * (0.15 + 0.85 * ((t / DURATION) % 1)))
    draw.rounded_rectangle((80, H - 48, W - 80, H - 36), radius=4, fill=(40, 40, 40))
    draw.rounded_rectangle((80, H - 48, 80 + meter_w, H - 36), radius=4, fill=ORANGE)

    # Soft vignette
    arr = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = W / 2, H / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    vig = np.clip(1.15 - 0.55 * r, 0.55, 1.0)[..., None]
    arr = np.clip(arr * vig, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def make_clip(path: Path, title: str, subtitle: str, accent_shift: float) -> None:
    title_font = font(72)
    sub_font = font(28)
    brand_font = font(22)
    frames: list[np.ndarray] = []
    n = int(FPS * DURATION)
    for i in range(n):
        t = i / FPS
        img = frame_base(t, accent_shift)
        draw = ImageDraw.Draw(img)
        draw_centered(draw, "FitAI Coach", 120, brand_font, ORANGE)
        # slight vertical bounce for energy
        bounce = int(6 * math.sin(t * 3.0 + accent_shift))
        draw_centered(draw, title, 250 + bounce, title_font, WHITE)
        draw_centered(draw, subtitle, 340 + bounce, sub_font, MUTED)
        frames.append(np.asarray(img))

    path.parent.mkdir(parents=True, exist_ok=True)
    imageio.mimsave(
        path,
        frames,
        fps=FPS,
        codec="libx264",
        quality=7,
        pixelformat="yuv420p",
        macro_block_size=1,
    )
    print(f"wrote {path} ({path.stat().st_size} bytes)")


def main() -> None:
    clips = [
        (
            "sample-hero-1.mp4",
            "BREAK ALL LIMITS",
            "Personalized AI workout plans for real athletes",
            0.0,
        ),
        (
            "sample-hero-2.mp4",
            "TRAIN SMARTER",
            "Coach Mode guidance that adapts as you train",
            1.2,
        ),
        (
            "sample-hero-3.mp4",
            "PUSH BEYOND",
            "Track progress. Build strength. Stay consistent.",
            2.4,
        ),
    ]
    for name, title, subtitle, shift in clips:
        make_clip(OUT_DIR / name, title, subtitle, shift)


if __name__ == "__main__":
    main()
