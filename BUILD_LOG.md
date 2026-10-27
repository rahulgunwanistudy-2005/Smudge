# Build log

**Competition:** NextSpark Hacks 2026 — https://nextspark-hacks.devpost.com
**Deadline (verified on the live page, 2026-10-25 14:45 UTC):** Oct 26, 2026 @ 10:00 pm CDT (= Oct 27, 03:00 UTC / 08:30 India).
**Sponsors listed:** none (checked overview + rules, 2026-10-25). No sponsor integrations are built.

Times are UTC. Each entry says what happened, what was decided, and what is still open.

## 2026-10-25

- **14:45** Re-read the Devpost overview and rules. Recorded the deadline above. Criteria: Creativity, Impact, Technical Execution, Design & UX (no weights published). Rules require: description, public repo with setup, 1–3 min public video, ≥1 screenshot, tools/credits/AI list; incomplete or simulated features must be labelled.
- **14:45** Verified platform facts: Chrome 152 (25 Aug 2026) ships Connection Allowlists; header syntax `Connection-Allowlist: (response-origin)` per the WICG draft (6 Oct 2026). Sources in `docs/sources.md`.
- **14:46** Toolchain survey of the build sandbox: GitHub, nist.gov and jsDelivr are blocked; apt, npm, PyPI, Maven and Google Storage work. Consequences:
  - NBIS source taken from the Ubuntu `libfprint` source package (it vendors NIST's `mindtct` + `bozorth3`). See ADR-003.
  - NFIQ 1 is **not** in libfprint and NIST's site is unreachable, so the NIST-trained NFIQ MLP weights are not vendored. We compute the NFIQ 1 *feature vector* from mindtct maps exactly as NBIS does, and label our quality grade "NFIQ-style". See ADR-004.
  - Emscripten 3.1.6 from Ubuntu apt compiles the C core to WASM.
- **14:47** Visual reference (Dribbble "Vizo — Neuro-Optical Health Scan UI") could not be fetched from the sandbox. Design direction is written from the builder's description: dark instrument UI, neon-green scan glow, scan visual as the dashboard hero — with a thumbprint instead of a face. See `docs/design-direction.md`.

## Continuation — 2026-10-27 01:50 UTC

- Switched to `main` at the existing scaffold commit. Verified Devpost deadline and requirements live; sponsor heading is empty, although the prize list now names Adaption and Anakin credits. No unsolicited integration.
- Research connector had no credits; direct official documentation and browsing used instead. The Vizo page palette was retrieved. Forest/mint design direction committed before UI.
- Implemented shared C tensor orientation, frequency, CLAHE, Gabor, FFT ridge-band suppression with low-pass cap, feathered luminance composition, Gaussian-window SSIM, NIST extraction and matching. Fixed missing reliability-sort symbol in existing glue.
- Native and Emscripten 4.0.23 SIMD builds succeed. Exact XYT/reliability and Bozorth3 parity passes on 50 generated synthetic fixtures. Property checks preserve zero-mask pixels.
- First browser scan and treatment succeeds without console errors: specimen 7 same-image baseline 197, final plain score 0, sharpened score 3, other tested variants 0. This is a synthetic diagnostic, not human efficacy.
- Upgraded dependencies to patched SvelteKit 3 / Vite 8 / Vitest 5 / PDF.js 6 after audit. All reported dependency vulnerabilities resolved at install.
- Current limits: no consenting human captures, no human FMR calibration, no learned super-resolution model, no real-device performance or blind A/B test. These are shown in the UI.

### 2026-10-27 02:12 UTC — workbench and release checks

- Completed responsive forest/mint frontend with thumbprint artwork, region review/loupe, no-reference state, before/after, per-attacker evidence and actual-export JPEG re-test.
- Added self-hosted MediaPipe, PDF.js, OCR, Verhoeff masking, PWA/cache/Share Target and actual-header privacy drawer. OCR passes pixel data directly, preserving connect-src self.
- Organized all implementation under `AI Assisted/`; reserved `Hand Written/` for human-authored work. Root toolchain records mapped in AI_USAGE.md.
- Added SourceAFIS3.18.1 independent synthetic experiment: both matchers accept12/12 baselines and0/84 post-treatment variants;0/66 synthetic impostors accepted at provisional40. No FMR calibration claim.
- Browser checks pass exact JPEG re-test, coordinate-free JSON, fresh metadata-free download, full offline reload, local hand detector, no-reference analysis, multipage PDF and positive OCR. Automated accessibility found an invalid label on a generic span; corrected to an image role and rerunning.
- User authorized Render My Workspace. Static creation API cannot configure privacy headers, so deploy a free static-file-only Node server with headers (no upload/processing API). No Vercel credentials were available; login flow cancelled.
- Initial JavaScript dependency closure is about46KB gzip, below150KiB. Real-phone speed and human efficacy targets remain unmeasured.
