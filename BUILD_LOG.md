# Build log

**Competition:** NextSpark Hacks 2026 — https://nextspark-hacks.devpost.com
**Deadline (verified on the live page, 2026-10-25 14:45 UTC):** Oct 26, 2026 @ 10:00 pm CDT (= Oct 27, 03:00 UTC).
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
