"""Warm golden-hour grade. usage: grade.py in out_base [--strength 1] [--sky 0] [--w 2400,1200] [--horizon 0.45]"""
import argparse
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--strength", type=float, default=1.0)
ap.add_argument("--sky", type=float, default=0.0)
ap.add_argument("--horizon", type=float, default=0.45)
ap.add_argument("--w", default="2400,1200")
ap.add_argument("--q", type=int, default=80)
a = ap.parse_args()

im = ImageOps.exif_transpose(Image.open(a.inp)).convert("RGB")
maxw = max(int(v) for v in a.w.split(","))
if im.width > maxw:
    im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
f = np.asarray(im).astype(np.float32) / 255.0
s = a.strength
H, W = f.shape[:2]

def lum(x): return (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2])[..., None]

# 1. golden sky: blue-dominant pixels in upper frame pulled to a sunset gradient, keeping their luminance texture
if a.sky > 0:
    y = np.linspace(0, 1, H)[:, None, None]
    t = np.clip(y / a.horizon, 0, 1)
    top = np.array([0.42, 0.50, 0.68]); mid = np.array([0.93, 0.68, 0.52]); hor = np.array([1.0, 0.80, 0.55])
    grad = np.where(t < 0.6, top + (mid - top) * (t / 0.6), mid + (hor - mid) * ((t - 0.6) / 0.4))
    blue = np.clip((f[..., 2:3] - np.maximum(f[..., 0:1], f[..., 1:2] * 0.9)) * 4.0, 0, 1)
    upper = np.clip(1.15 - y / (a.horizon * 1.15), 0, 1)
    wgt = blue * upper * a.sky
    L = lum(f)
    target = grad * (0.55 + 0.75 * L)
    f = f * (1 - wgt) + target * wgt

# 2. warm white balance
f = f * np.array([1 + 0.06 * s, 1 + 0.01 * s, 1 - 0.11 * s])

# 3. split tone: amber highlights, umber shadows
L = lum(f)
hi = np.clip((L - 0.5) / 0.5, 0, 1); lo = np.clip(1 - L / 0.4, 0, 1)
f = f + hi * np.array([0.05, 0.015, -0.05]) * s + lo * np.array([0.02, 0.004, -0.02]) * s

# 4. vibrance on warm hues, slight pull on cyan
f = np.clip(f, 0, 1)
mx = f.max(-1, keepdims=True); mn = f.min(-1, keepdims=True); sat = mx - mn
warm = np.clip((f[..., 0:1] - f[..., 2:3]) * 3, 0, 1)
L = lum(f)
f = L + (f - L) * (1 + 0.18 * s * warm * (1 - sat))
cyan = np.clip((f[..., 2:3] + f[..., 1:2]) / 2 - f[..., 0:1], 0, 1) * 2
f = f * (1 - 0.12 * s * cyan) + (L * np.array([1.05, 0.98, 0.9])) * (0.12 * s * cyan)

# 5. contrast S curve
f = np.clip(f, 0, 1)
f = f + 0.12 * s * (f - 0.5) * (1 - np.abs(2 * f - 1))

# 6. warm bloom
img = Image.fromarray((np.clip(f, 0, 1) * 255).astype(np.uint8))
hl = np.clip((lum(f)[..., 0] - 0.65) / 0.35, 0, 1)
bl = Image.fromarray((hl * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=max(6, W / 80)))
b = np.asarray(bl).astype(np.float32)[..., None] / 255 * np.array([1.0, 0.70, 0.40]) * 0.25 * s
f = 1 - (1 - f) * (1 - b)

# 7. vignette
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
f = f * (1 - 0.18 * s * np.clip(d - 0.6, 0, 1) ** 1.5)[..., None]

out = Image.fromarray((np.clip(f, 0, 1) * 255).astype(np.uint8))
for w in [int(v) for v in a.w.split(",")]:
    o = out if out.width <= w else out.resize((w, round(out.height * w / out.width)), Image.LANCZOS)
    o.save(f"{a.out}-{w}.webp", "WEBP", quality=a.q, method=6)
print("ok", a.out)
