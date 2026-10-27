# Work classification

All implementation lives under `AI Assisted/`; `Hand Written/` is reserved for human-authored work. Root package/lock/CI files are classified as AI Assisted because tooling requires them there.

Every project-owned deliverable belongs to exactly one requested category: **Hand Written** or **AI Assisted**. Third-party components retain separate authorship and licence credits. Classification does not assert that a human has reviewed generated work.

| Work | Category | Basis |
|---|---|---|
| Product requirements and Vizo reference choice supplied in this session | Hand Written | Human-provided direction; original attachment stays outside the repository. |
| Application, styles, SVG artwork, icons and worker integrations | AI Assisted | Implemented by the coding assistant under the builder's direction. |
| Native core, NBIS adaptation, TypeScript engine and tests | AI Assisted | Written or adapted by the coding assistant. NIST algorithms are third-party. |
| Synthetic specimens, evaluation scripts and committed result JSON | AI Assisted | Script-generated; not human biometrics or real-world efficacy evidence. |
| Build, asset, preview, CI, deployment and browser-test tooling | AI Assisted | Written by the coding assistant. |
| README, build log, ADRs, submission draft, script and other documentation | AI Assisted | Prepared by the coding assistant; builder review remains necessary. |
| Work indexes in `Hand Written/` and `AI Assisted/` | AI Assisted | Classification records created by the coding assistant. |

No implementation file is claimed as Hand Written. `AI Assisted/engine/nbis/` is NIST-origin third-party material obtained through libfprint; see its NOTICE and individual file headers. MediaPipe, SourceAFIS, Svelte, PDF.js, Tesseract, fonts, compiler runtimes and their assets are third-party, not the builder's original work. See `AI Assisted/docs/credits.md` and the package lock.

Commit messages use ordinary project descriptions without attribution trailers. This file provides the disclosure required by the build brief and competition rules.
