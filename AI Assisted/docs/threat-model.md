# Threat model

Smudge is a defensive prototype for people who choose to reduce fingerprint ridge detail in their own photographs. It does not unlock devices, identify strangers, reconstruct a physical fingerprint, or export biometric templates.

## In scope

A selected image is decoded locally, analysed in a dedicated worker, altered within selected regions, encoded as JPEG, decoded again, and tested with NIST Bozorth3 against an optional user-supplied reference. App variants include enhancement, unsharp masking, 2×/4× Lanczos, JPEG 60/80/95 and the exact exported full-image JPEG. Without a reference the app displays no identity-match score; internal same-image diagnostics remain clearly labelled. Synthetic examples explicitly enable same-image comparison.

## Privacy boundary

There is no photo-upload API, remote inference, tracking, external font, or CDN runtime. Models are self-hosted and cached. The production header server returns a CSP (with hashed bootstrap), Connection-Allowlist, COOP/COEP, Referrer-Policy and Permissions-Policy. Header presence does not prove browser implementation support. CSP and service-worker restrictions are distinct layers; the resource counter is an observation aid, not an exhaustive attestation. Same-origin requests are allowed for static assets. A compromised origin could change this application, so the hosting origin and code remain trusted.

Ordinary images, references, ROIs and minutiae are held in browser memory. Reload clears them. The installed Share Target uses the browser's Cache API for a one-time local file handoff; it deletes the file when opened. If the handoff is interrupted before opening, the file remains in local site storage until the site is cleared. The service worker stores application assets and models, never ordinary uploaded images. The only localStorage key stores light/dark preference. Exports go to the user's chosen download destination.

## Out of scope / not validated

No calibrated human false-match rate; no proof against all matchers; no learned super-resolution attack; no spoofing/liveness/sensor assessment; no guarantee that detection finds all hands, distinguishes palm reliably, or works at every capture distance. Compromised browser, extensions, OS, screen recording, local storage access and arbitrary side channels are outside the boundary.

Image quality may change visibly. A low score can reflect bad capture or no detected minutiae. A pass requires an accepted baseline, every tested after score below the provisional line, and fewer than six reliable after points. This test does not establish that a real attacker cannot recover identity. If verification fails, crop or retake.
