# Evaluation

All results are under `../lab/results/`. The app reads copies of synthetic and independent results served from its own origin. No headline is a human efficacy claim.

## Methods

`make eval` compiles the shared native core, evaluates twelve deterministic 192×240 ridge-like textures (seeds1–12), tries strengths0.4/0.7/1, records actual NIST mindtct points, Bozorth3 scores and ROI SSIM, and asserts exact zero-mask preservation. It also generates fifty native/WASM parity fixtures (seeds1–50). The independent experiment uses fixed strength1, SourceAFIS3.18.1 plus Bozorth3, eight after variants per sample, and all66 unordered synthetic impostor pairs. The eighth after variant is a learned ESPCN4x upscaler (Apache2.0, OpenCV GSoC model; exact graph SHA256 in independent.json).

The browser uses a closed loop of three strengths. It tests plain enhancement, re-sharpening, 2×/4× Lanczos (capped at1024), JPEG60/80/95, then the exact exported full-image JPEG. Every tested after score must be<40 and every reliable count<6. A baseline must match first for a diagnostic pass. Without independent enrolment, the UI either shows no biometric score (uploads) or a labelled same-image baseline (procedural examples). Scores from different matchers are not numerically interchangeable.

## Recorded synthetic results

| Experiment | Before | After | Meaning |
|---|---|---|---|
| Native closed-loop plain matcher,12 textures | 12/12 matches | 0/12 matches | Same-image diagnostic only |
| Independent SourceAFIS, fixed strength1 | 12/12 matches | 0/96 attacker matches | Independent extractor on the same synthetic generator |
| NBIS Bozorth3, same independent experiment | 12/12 matches | 0/96 attacker matches | Eight after variants per texture |
| Synthetic impostor pairs, each matcher | — | 0/66 above40 | Too few and too artificial for a population FMR claim |
| Native ↔ WASM parity | 50 inputs | exact XYT/reliability and self-match scores | Test runner asserts equality |

`synthetic.json` records mean **ROI** SSIM around0.408 at the stopping strength, substantially below0.98. Strong suppression visibly changes close-ups. The browser computes separate full-photo metrics on the actual downloaded JPEG; the representative specimen report is in `browser-report.json`. Never substitute full-photo SSIM for ROI SSIM or call either an identity-safety score.

## Formula

Exposure = round(100 × [0.55 × min(HQ/40,1) +0.30 × coherent-fraction +0.15 × (5−grade)/4]). HQ counts mindtct reliability≥0.5. Grade=clamp(5−floor(HQ/8),1,5). Coherent fraction uses orientation coherence>0.25 and a detected ridge period in16px blocks. Minimal<20; Low20–44; High45–74; Critical≥75. Formula and tier boundaries are heuristic, not calibrated. Matcher margin is deliberately not mixed into this score because references may be absent.

## Similarity and performance

Gaussian local SSIM uses11×11 windows, sigma1.5. Images above262,144 pixels sample every other centre to bound cost. PSNR uses full-image luminance MSE. Browser metrics include JPEG recompression and reviewed identifier masks. Before encoding, zero-mask pixels are copied exactly; JPEG encoding changes pixels elsewhere.

`bundle-budget.json` records the initial JavaScript gzip dependency closure and model/static sizes. It does not measure real phones. The 600ms desktop /2s Android targets,12MP ingest150ms, main-thread50ms and Lighthouse95 targets are not claimed as achieved unless a separate measured artifact says so.

## Limitations

No consenting human study, contactless distance curve, detection recall/precision, human genuine/impostor calibration, LPIPS, blind A/B study, trained NFIQ1 or biometric sensor spoof test. Default ROI DPI is500; physical contactless scale is not inferred. Photo suggestions use conservative axis-aligned boxes; document detection uses directional texture and needs review. OCR can miss or misread numbers, and a checksum is not identity verification. Fixed JPEG export quality0.95 is not input-quality estimation. HEIC uses native browser support when available; otherwise the user must convert to JPEG. PDFs export one chosen page as JPEG; preserving whole PDF structure is not implemented. WebGPU, multithreaded core, identity replacement and batch processing are not shipped.

## Recorded frontend audit

Lighthouse13.5.0, local production server with Brotli, mobile simulation:98 Performance,100 Accessibility,100 Best Practices. Full JSON and a compact summary are committed. Initial delivery was improved by moving ornamental SVG out of server HTML, serving tiny WebP specimen previews, and precompressing assets. This audit does not measure the CPU-heavy scan itself or a real phone. Reproduce with `node 'AI Assisted/scripts/audit-lighthouse.mjs'` while the production preview is running; set CHROME_PATH to an installed Chrome executable when required.
