# ADR-003: Delivery and evidence

Date: 2026-10-26 UTC / 2026-10-27 India. Status: accepted.

Compile the existing vendored NBIS code to native and WebAssembly. Use a dedicated worker for all expensive analysis and redaction. Serve models locally. Never substitute a made-up match score when a reference is absent. Synthetic specimens may use a clearly labelled same-image baseline comparison.

No consented human images are available in this repository. Human efficacy, distance calibration, real-device budgets, independent matcher validation and hallway testing remain unverified until collected. A provisional matcher threshold is not a calibrated FMR.

Keep source in the monorepo folders. `Hand Written/` and `AI Assisted/` are work indexes; `AI_USAGE.md` assigns every owned path to one category. Third-party code keeps its own licence. Do not assert human review until it happens.
