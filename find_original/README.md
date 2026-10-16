# find_original

Trying to recover the source painting behind an old edit (`input/edit.jpg`).

- `preprocess.py` — writes search variants to `../variants/` (each with `__grey` and `__contrast` versions):
  - `10_x_inpainted` — X removed with OpenCV Telea inpainting (loses what's inside the X)
  - `11_x_unbrightened` — X region tone-matched back to the rest of the image; keeps the umbrella that sits inside the X. **Most useful variant.**
  - `20–23_crop_*` — centre / umbrella / upper / lower crops, raw and un-brightened
  - `30_deblur_*` — best 3 Wiener/RL deconvolutions (angle 30–50°, length 10–50 px at half res). They ring badly; the smear is too long and non-linear for a motion PSF to undo.
  - `40_lowpass_gist` — heavily low-passed, for engines that match on composition
  - `x_mask.png` — hand-traced X polygon (thresholding also grabbed the painting's light centre)
- `reverse_search.mjs` — Playwright uploader for Yandex/Bing/TinEye/Lens. Must be run locally; untested.
- `variants_contact_sheet.jpg` — all variants on one sheet.

Measured blur: streaks rise lower-left → upper-right at ~45°.
