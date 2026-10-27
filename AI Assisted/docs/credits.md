# Tools, resources and licences

- NIST NBIS mindtct / Bozorth3: public-domain U.S. federal source; individual disclaimers remain. Obtained in the scaffold from libfprint 1.94.7; libfprint adaptations are credited and its LGPL-2.1-or-later terms must be retained. Source and build instructions are included, no claim of NIST certification or endorsement. https://www.nist.gov/services-resources/software/nist-biometric-image-software-nbis
- MediaPipe Tasks Vision 0.10.32 and Hand Landmarker float16 model v1: Google / Apache-2.0, self-hosted. https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- SourceAFIS Java 3.18.1: Robert Važan and contributors, Apache-2.0. Lab only; dependencies resolved by Maven. https://sourceafis.machinezoo.com/java
- Tesseract.js 6 and Tesseract.js Core: Apache-2.0. English traineddata from Project Naptha's published model distribution. All runtime files self-hosted. https://github.com/naptha/tesseract.js
- PDF.js 6: Mozilla contributors, Apache-2.0. https://github.com/mozilla/pdf.js
- Manrope and IBM Plex Mono: SIL Open Font License 1.1; self-hosted via Fontsource. https://fontsource.org/fonts/manrope and https://fontsource.org/fonts/ibm-plex-mono
- Svelte 5 / SvelteKit 3 / Vite 8 / TypeScript 6 / Vitest 5 / Playwright / NumPy / Pillow / Emscripten: respective upstream licences. Exact JavaScript versions in root `package-lock.json`; compiler pinned to Emscripten 4.0.23. Emscripten output includes linked libc runtime; see https://emscripten.org/docs/introducing_emscripten/emscripten_license.html.
- Visual inspiration: Jack R. for RonDesignLab, Vizo Mobile App. Used as a palette and instrument-aesthetic reference; no illustration or screenshot was copied into the app. https://dribbble.com/shots/27507443-Vizo-Mobile-App-Neuro-Optical-Health-Scan-UI
- AI tool use and human contribution: root `AI_USAGE.md` and the `Hand Written` / `AI Assisted` folders. No human review is asserted by the assistant.

App-local dependency notices are preserved in `app/static/licenses/`. Model and runtime checksums are listed in `asset-manifest.json`. Third-party authorship is distinct from the requested work categories.

- Learned lab attacker: Fanny Monori / TF-ESPCN, OpenCV GSoC2019, Apache2.0. The100,323-byte graph and licence are retained under lab/models; the committed independent JSON records its SHA256. General image upscaling is not fingerprint-specific recovery. https://github.com/fannymonori/TF-ESPCN
