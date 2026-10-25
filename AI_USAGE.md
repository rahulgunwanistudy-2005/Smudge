# AI usage disclosure

NextSpark Hacks allows AI tools if they are disclosed and the builder's own work is distinguished.
This file maps every module to how it was produced. It is updated as modules land.

Legend:
- **Hand-written** — written by the builder.
- **AI-assisted** — the builder wrote or directed the design; an AI coding assistant helped write parts, and the builder reviewed every line.
- **AI-generated, then reviewed** — first draft produced by an AI coding assistant from the builder's spec, then read, tested and edited by the builder.
- **Third-party** — not our code; credited with its licence.

| Module | Provenance | Notes |
|---|---|---|
| `engine/nbis/` (mindtct, bozorth3) | Third-party (NIST, public domain) | Vendored from the libfprint source package; glib calls replaced by a shim. |
| `engine/native/smudge_core.c` | AI-generated, then reviewed | Orientation field, frequency, Gabor, block-FFT smudge, SSIM. Spec in `docs/explain-it-live.md`. |
| `engine/native/nbis_glue.c`, `glib_shim.h` | AI-generated, then reviewed | Thin C API over NBIS for WASM + ctypes. |
| `engine/src/` (TypeScript worker protocol) | AI-generated, then reviewed | |
| `lab/` (Python evaluation harness) | AI-generated, then reviewed | Every number it produces is reproducible with `make eval`. |
| `app/` (SvelteKit UI) | AI-assisted | Design direction set by the builder (Vizo reference, thumbprint-scan hero). |
| `docs/` | AI-assisted | Sources verified by following each link. |

The project spec (pipeline stages, acceptance criteria, ethics rules) was written by the builder before any code.
The builder must be able to explain every line; `docs/explain-it-live.md` is the crib sheet for that.
