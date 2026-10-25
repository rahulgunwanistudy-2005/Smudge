# ADR-001: No cloud backend for user data; the "backend" is an on-device engine

- Status: accepted
- Date: 2026-10-25

## Context
Smudge's promise is "your photo never leaves your phone." Any server that receives the photo — even briefly, even "deleted after processing" — turns that promise into a policy statement the user has to trust. A judge or a user cannot verify a deletion policy. They *can* verify that no request left the page.

The work itself is heavy: minutiae extraction, matching and a closed-loop FFT smudge on several fingertip regions of a 12 MP photo.

## Decision
1. All user-image processing runs on the device:
   - a C core (NIST NBIS `mindtct` + `bozorth3`, plus our enhancement and smudge code) compiled to WebAssembly with `-O3` and SIMD;
   - run inside Web Workers so the main thread stays responsive;
   - MediaPipe Hand Landmarker (wasm + model) served from our own origin.
2. The same C sources are compiled natively for the Python research lab (`lab/`), so lab numbers and app behaviour come from the same code. Parity tests enforce it.
3. Hosting is a static site. The only server behaviour is response headers (CSP, Connection-Allowlist, COOP/COEP).
4. Evidence (thresholds, charts, attack results) is produced offline in `lab/` and shipped as committed JSON. The app renders that JSON; it never phones home.

## Consequences
- Privacy is a property the browser enforces (Connection-Allowlist, CSP) and the app can display, not a promise.
- Model and wasm must be lazy-loaded and cached by a service worker; first load is heavier than a thin client.
- No server means no aggregate telemetry. We accept that.
- An optional self-hosted batch tool for institutions (`batch/`) reuses the same native core, on *their* servers.
