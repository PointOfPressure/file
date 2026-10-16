"""Generate search-friendly variants of the edited image.

Usage: python3 find_original/preprocess.py find_original/input/edit.jpg variants/
The input file is only ever read.
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from skimage import restoration

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

im = cv2.imread(str(src))
H, W = im.shape[:2]
gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)


def save(name, img):
    cv2.imwrite(str(out / f"{name}.png"), img)
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(str(out / f"{name}__grey.png"), g)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cv2.imwrite(str(out / f"{name}__contrast.png"), clahe.apply(g))


# --- X mask -----------------------------------------------------------------
# Brightness thresholds also catch the painting's own light centre, so the X is
# traced by hand from its straight edges (coords in the 918x924 source).
X_POLY = np.array([
    (0, 0), (200, 0), (470, 345), (640, 530), (918, 830), (918, 924),
    (690, 924), (470, 650), (150, 810), (70, 600), (200, 500), (300, 440), (0, 80),
], np.int32)
sx, sy = W / 918, H / 924
mask = np.zeros((H, W), np.uint8)
cv2.fillPoly(mask, [(X_POLY * [sx, sy]).astype(np.int32)], 255)
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
cv2.imwrite(str(out / "x_mask.png"), mask)

save("00_original_copy", im)

# --- inpainted (X removed entirely) ------------------------------------------
small = cv2.resize(im, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
msmall = cv2.resize(mask, (W // 2, H // 2), interpolation=cv2.INTER_NEAREST)
inp = cv2.inpaint(small, msmall, 15, cv2.INPAINT_TELEA)
save("10_x_inpainted", cv2.resize(inp, (W, H), interpolation=cv2.INTER_CUBIC))

# --- X "un-brightened": match the X region's tone curve to the rest ----------
# Keeps the umbrella/figure detail that sits inside the X.
def match_hist(srcvals, refvals):
    s_q = np.linspace(0, 1, 256)
    s_v = np.quantile(srcvals, s_q)
    r_v = np.quantile(refvals, s_q)
    return lambda x: np.interp(x, s_v, r_v)

f = match_hist(gray[mask > 0], gray[mask == 0])
unbright = gray.astype(float).copy()
unbright[mask > 0] = f(gray[mask > 0].astype(float))
soft = cv2.GaussianBlur(mask.astype(float) / 255, (31, 31), 0)
unbright = soft * unbright + (1 - soft) * gray
save("11_x_unbrightened", np.clip(unbright, 0, 255).astype(np.uint8))

# --- crops of least-distorted regions ----------------------------------------
crops = {
    "20_crop_centre_umbrella": (380, 460, 720, 760),   # x0,y0,x1,y1
    "21_crop_centre_wide": (250, 250, 780, 800),
    "22_crop_upper_figure": (300, 120, 800, 560),
    "23_crop_lower_half": (0, 460, 918, 924),
}
for name, (x0, y0, x1, y1) in crops.items():
    save(name, im[y0:y1, x0:x1])
    save(name + "_unbright", np.clip(unbright, 0, 255).astype(np.uint8)[y0:y1, x0:x1])

# --- deblur ------------------------------------------------------------------
def motion_psf(length, angle_deg):
    k = np.zeros((length * 2 + 1, length * 2 + 1))
    c = length
    a = np.radians(angle_deg)
    dx, dy = np.cos(a), -np.sin(a)  # y-down: positive angle = rising streak
    for t in np.linspace(-length / 2, length / 2, length * 4):
        k[int(round(c + t * dy)), int(round(c + t * dx))] = 1
    return k / k.sum()


def score(img, ref):
    # A correct kernel removes the directional streaks, so gradient energy
    # becomes more isotropic. Penalise drift from the input's low frequencies
    # (what a wrong kernel's ringing does). Borders are excluded.
    m = 40
    img, ref = img[m:-m, m:-m], ref[m:-m, m:-m]
    gx = cv2.Sobel(img, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(img, cv2.CV_64F, 0, 1, ksize=3)
    J = np.array([[(gx * gx).mean(), (gx * gy).mean()], [(gx * gy).mean(), (gy * gy).mean()]])
    ev = np.linalg.eigvalsh(J)
    iso = ev[0] / ev[1]
    drift = np.abs(cv2.GaussianBlur(img, (31, 31), 0) - cv2.GaussianBlur(ref, (31, 31), 0)).mean()
    return iso / (1 + 20 * drift)


base = np.clip(unbright, 0, 255).astype(np.float64) / 255
base_s = cv2.resize(base, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
pad = 60
base_p = cv2.copyMakeBorder(base_s, pad, pad, pad, pad, cv2.BORDER_REFLECT)
results = [(score(base_s, base_s), 0, 0, "none", base_s)]
for angle in (30, 35, 40, 45, 50):
    for length in (10, 20, 35, 50):
        psf = motion_psf(length, angle)
        for method in ("wiener", "rl"):
            if method == "wiener":
                r = restoration.wiener(base_p, psf, balance=0.1)
            else:
                r = restoration.richardson_lucy(base_p, psf, num_iter=15)
            r = np.clip(r[pad:-pad, pad:-pad], 0, 1)
            results.append((score(r, base_s), angle, length, method, r))

results.sort(key=lambda r: -r[0])
with open(out / "deblur_scores.txt", "w") as fh:
    for sc, a, l, m, _ in results:
        fh.write(f"{m:7s} angle={a:3d} len={l:3d} score={sc:.5f}\n")
for i, (sc, a, l, m, img) in enumerate([r for r in results if r[3] != "none"][:3]):
    u8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
    save(f"30_deblur_{i}_{m}_a{a}_l{l}", cv2.resize(u8, (W, H), interpolation=cv2.INTER_CUBIC))

# --- heavy blur along the streaks' perpendicular is useless; instead a coarse
# low-pass version approximates the "gist" that reverse-search engines key on.
save("40_lowpass_gist", cv2.GaussianBlur(np.clip(unbright, 0, 255).astype(np.uint8), (0, 0), 6))
print("done:", len(list(out.glob("*.png"))), "files")
