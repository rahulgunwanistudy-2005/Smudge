# Smudge

**You can change a password. You can’t change your fingerprint.**

Smudge finds fingerprint detail in selected photo regions, suppresses ridge patterns, and tests the **exact exported JPEG** with a real NIST fingerprint matcher. Photos are processed on-device. No upload account or inference service is used.

![Smudge workbench](AI%20Assisted/docs/screenshots/dashboard.png)

This is a working defensive prototype, **not a validated guarantee against biometric theft**. Its built-in specimens and committed efficacy tests are synthetic. Human validation and false-match calibration remain open.

## Try it locally

Node24 and npm are required. From the repository root:

```sh
npm ci
npm run dev
```

For the production response policies and offline PWA:

```sh
npm run build
npm run preview
```

Open **http://127.0.0.1:4318**. The development server uses port4317. Production assets and self-hosted models are committed, so the normal app build needs no model downloads or compiler. After the first production visit finishes caching, turn on airplane mode, reload, and try a specimen.

1. Choose a synthetic specimen, or confirm permission and choose your photo.
2. Find fingertips, select a close-up, or draw a region. Review every suggested region.
3. Optionally enrol a tight close-up of the same finger (≤1024px per side).
4. Analyse, inspect ridge points, and choose **Smudge selected prints**.
5. Review every result and download the photo and coordinate-free evidence report.

Without a reference, uploaded images show **no identity-match score**. Synthetic specimens use an explicitly labelled same-image diagnostic. A failed result recommends cropping or retaking the photo.

## What is implemented

- Responsive mint/forest workbench, original thumbprint scan artwork, light/dark themes, keyboard-operable comparison and inspection.
- SvelteKit3 static PWA; installable manifest and gallery Share Target; offline cache of app, local models and WASM.
- Real NIST mindtct/Bozorth3 compiled to SIMD WebAssembly in a dedicated worker, with a native build of the same C code.
- MediaPipe hand-landmark suggestions, manual/numeric region editing, document texture proposals, local PDF page rendering.
- Local document OCR, Verhoeff checks, and reviewed masking of the first eight digits of checksum-valid Aadhaar-like identifiers. This is not identity verification.
- Contrast normalization, orientation/frequency/Gabor analysis, two-polarity extraction, orientation-weighted FFT ridge suppression and a low-pass fallback.
- Three-strength verification loop against enhancement, sharpening, Lanczos2/4 and JPEG60/80/95; then an additional check against the exact downloaded full-image JPEG.
- Actual exported-image SSIM/PSNR, fresh metadata-free JPEG encoding, per-variant results, and downloadable reports that omit minutiae.
- Privacy drawer with observed requests, actual response headers, browser-policy limitations and offline status.

## Architecture

![On-device architecture](AI%20Assisted/docs/architecture.svg)

There is deliberately no backend that receives photos. Static hosting supplies code and models; a worker performs the expensive computation. A native Python/Java lab produces reproducible evidence without becoming a public upload service. See [threat model](AI%20Assisted/docs/threat-model.md) and [explain it live](AI%20Assisted/docs/explain-it-live.md).

Ordinary uploads and references remain in browser memory. Reload clears them. **Share Target exception:** the browser uses a one-time local handoff cache, deleted on open; an interrupted handoff remains in local site storage until cleared. App/model assets are cached, not ordinary uploaded photos. Only the theme preference is stored in localStorage.

The preview serves Connection-Allowlist, CSP, COOP/COEP and privacy headers. CSP hashes come from the production build. Header presence is reported separately from browser enforcement support. The resource counter is an audit aid, not an attestation covering browser/OS/extension activity.

## Reproduce the evidence

```sh
npm run check
npm test
npm run build
npm run budget
```

Native lab (Python3.11+, C compiler):

```sh
python3 -m pip install -r 'AI Assisted/lab/requirements.txt'
make eval
```

Rebuild browser core (Emscripten4.0.23 activated):

```sh
make wasm
```

Independent matcher (Java11+, Maven):

```sh
mvn -f 'AI Assisted/lab/matchers/sourceafis/pom.xml' dependency:copy-dependencies -DoutputDirectory=lib
npm run eval:independent
```

Full production browser tests (start `npm run preview` first):

```sh
python3 -m pip install -r 'AI Assisted/tests/requirements.txt'
python3 -m playwright install chromium
npm run test:e2e
```

CI rebuilds native/WASM, checks exact parity, builds the PWA, checks the bundle budget, and runs the browser flow including offline reload and no external requests.

| Committed synthetic evidence | Result |
|---|---|
| Native ↔ WASM XYT, reliability and self-score parity | 50/50 exact fixtures |
| Native plain baseline → after,12 textures | 12/12 → 0/12 accepted |
| SourceAFIS baseline → post-treatment variants | 12/12 → 0/96 accepted |
| Bozorth3 baseline → same post-treatment variants | 12/12 → 0/96 accepted |
| Synthetic impostor pairs, each matcher | 0/66 accepted at provisional40 |

Sources: [synthetic JSON](AI%20Assisted/lab/results/synthetic.json), [independent JSON](AI%20Assisted/lab/results/independent.json), [methods and limits](AI%20Assisted/docs/evaluation.md). A browser report and test artifacts are committed alongside them. Twelve procedural textures and66 impostor pairs **do not** calibrate a human FMR. The two matchers have different score scales.

The self-hosted model/runtime set is approximately **48.2MiB**, plus the small fingerprint core, detector bundle and fonts. Exact file sizes and SHA-256 checksums: [asset manifest](AI%20Assisted/docs/asset-manifest.json). The final local simulated-mobile Lighthouse run scored **98 Performance /100 Accessibility /100 Best Practices** ([recorded report](AI%20Assisted/lab/results/lighthouse-summary.json)). This does not measure a real phone. The initial route’s JavaScript budget is150KiB gzip; [measured budget](AI%20Assisted/lab/results/bundle-budget.json) distinguishes initial code from offline asset prefetch.

## Limits you should know

The line40 is provisional, not calibrated at FMR0.1%. The quality grade is **NFIQ-style**, not trained NFIQ. Human contactless efficacy, detection recall/precision, capture-distance performance, human validation against learned super-resolution, LPIPS, blind A/B testing and phone latency are unmeasured. Strong treatment can visibly blur a close-up. The synthetic ROI SSIM is about0.408; full-photo similarity is a different metric and must not hide that tradeoff.

Automatic suggestions can miss a finger or include the wrong side. DPI defaults to500 and physical contactless scale is not calibrated. Review regions manually. HEIC depends on native browser decoding; convert to JPEG when unsupported. PDFs are processed/exported **one page at a time as JPEG**. Export quality is fixed0.95, not estimated from the input. WebGPU, multithreading, identity replacement and institution batch processing are not implemented.

## Work and credits

All implementation, assets, tests and supporting documents are in **[AI Assisted](AI%20Assisted/)**. **[Hand Written](Hand%20Written/)** is reserved for your personally authored work; no generated implementation is claimed as yours. Root package/lock/CI/deployment records are classified in [AI_USAGE.md](AI_USAGE.md). Commit messages use ordinary descriptions without attribution trailers.

NIST NBIS (public domain, through libfprint), MediaPipe/SourceAFIS/PDF.js/Tesseract (Apache-2.0), Svelte/Vite and self-hosted OFL fonts are credited in [credits](AI%20Assisted/docs/credits.md). Visual direction references [Vizo by Jack R. / RonDesignLab](https://dribbble.com/shots/27507443-Vizo-Mobile-App-Neuro-Optical-Health-Scan-UI); no artwork was copied. Prior finger-selfie anonymization research is credited in [sources](AI%20Assisted/docs/sources.md). Smudge does not claim to invent the underlying research problem.

Only use images you own or have permission to process. No physical-clone instructions, crop exports or biometric-template exports are provided. See [ethics](AI%20Assisted/docs/ethics.md), [consent template](AI%20Assisted/docs/consent.md), [build log](BUILD_LOG.md), [red-team review](AI%20Assisted/docs/red-team.md), and [submission checklist](AI%20Assisted/docs/submission-checklist.md).
