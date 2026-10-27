# Smudge

## Inspiration

You can change a password. You cannot change your fingerprint. High-quality photos can expose biometric ridge detail. Smudge explores a practical defence: inspect the detail before sharing, reduce it locally, and show the actual matcher results instead of a blanket safety promise.

The Chaos Computer Club described reconstructing a fingerprint from public photographs in2014. Finger-selfie anonymization is also an established research area; we credit prior work rather than claiming to invent it. Our focus is an inspectable browser workflow with local computation, a closed loop, and verification of the exact exported image.

## What it does

Choose a synthetic specimen or a photo you have permission to process. Smudge suggests fingertip regions with MediaPipe; you review and adjust them. It extracts real minutiae using NIST mindtct. If you enrol a close-up of the same finger, it compares against that reference with NIST Bozorth3. Without one, it shows no identity-match score.

Smudge then suppresses ridge-frequency detail at increasing strengths. It re-tests enhancement, sharpening, Lanczos upscaling and JPEG recompression. Finally it encodes the full photo, reopens that exact JPEG, and checks it again. You can inspect results, compare before/after, and download the photo and a report without minutiae coordinates.

Document mode opens a selected PDF page or scan. Local OCR plus Verhoeff validation can suggest masking the first eight digits of Aadhaar-like numbers. The checksum does not prove identity, and OCR requires human review. The installable PWA works offline after assets have been cached and supports receiving files through Share Target.

## How we built it

Svelte5 / SvelteKit3 / TypeScript6, built as static assets. A shared C engine links NIST NBIS and compiles to native code for evaluation and SIMD WebAssembly for a dedicated browser worker. It computes contrast enhancement, orientation/frequency fields and Gabor candidates, tries both ridge polarities, extracts minutiae and runs Bozorth3. Overlapping FFT blocks suppress a ridge-frequency band, with a low-pass fallback at high strength and a feathered luminance composite.

MediaPipe, PDF.js, Tesseract, WASM and fonts are self-hosted. There is no photo-upload API. Production response policies restrict connections, and the privacy drawer displays actual headers and observed resource requests. Offline and no-external-request browser tests exercise the real processing path.

## What we measured

Fifty synthetic fixtures return identical native/WASM minutiae, reliability and self-match scores. Twelve procedural ridge textures match their own baselines before treatment; none matches afterward under the native plain test. A separate experiment with NIST Bozorth3 and independent SourceAFIS has12/12 accepted baselines and0/96 accepted post-treatment attacker comparisons for each matcher. All raw scores and generation scripts are committed.

**These are synthetic, same-image diagnostics, not validated protection for real human fingerprints.** Threshold40 is provisional and not calibrated at a0.1% false match rate. Strong treatment changes ridge close-ups visibly; the mean synthetic ROI SSIM is about0.408. Full-photo similarity is reported separately on the exact JPEG and must not conceal the close-up tradeoff.

## Challenges

Normalization changes minutiae stability. A strong edit can beat a matcher while looking visibly blurred. It is easy to mislead by showing a match without a reference or by measuring a pre-encode image instead of the downloadable file. We made those boundaries explicit and added the exact-export re-test. Local model loading and document OCR also had to work inside the same-origin policy and offline cache.

## What we learned

An absence of a match is evidence about a specific comparator and input, not a universal security guarantee. A useful prototype needs to surface that distinction. Privacy must also be architectural: keeping computation local is more defensible than promising a remote server will delete sensitive photos.

## What is incomplete

No consenting human contactless dataset, calibrated FMR, measured detection recall/precision, distance chart, human learned-super-resolution validation, trained NFIQ, LPIPS, blind A/B test or real-phone latency validation. The quality grade is NFIQ-style. Contactless DPI is not calibrated. Region suggestions are conservative axis-aligned boxes, and document candidates use directional texture. Unsupported HEIC requires conversion. PDF export is one selected page as JPEG. Identity replacement, WebGPU, multithreaded core and institutional batch processing are not implemented.

## What is next

Collect an ethically consented contactless dataset, calibrate both matchers, expand learned-upscale tests, and improve perceptual quality against those stronger checks before making efficacy claims.

## Credits and work disclosure

NIST NBIS through libfprint; Google MediaPipe; SourceAFIS; PDF.js; Tesseract.js; Emscripten; Svelte/SvelteKit/Vite; Manrope and IBM Plex Mono. Visual palette/instrument inspiration: Vizo by Jack R. / RonDesignLab. Prior research and licences are in the repository. Product brief and reference choice were human inputs; implementation and supporting materials are classified AI Assisted. No generated code is labelled Hand Written. The builder should review and be able to explain the work before submitting.
