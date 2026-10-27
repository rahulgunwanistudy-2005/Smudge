# Red-team review

| Challenge | Evidence and answer | Remaining limit |
|---|---|---|
| Isn't this just a blur? | FFT ridge-band suppression plus a high-strength low-pass fallback. Real Bozorth3 re-test and exact-export re-test, with raw scores. | At the cap it can look blurred. Invisible editing is not claimed. |
| The attacker is weak. | App tests enhancement, unsharp mask, Lanczos2/4, JPEG60/80/95, and exact export. Independent SourceAFIS synthetic results are committed. | ESPCN4x covers synthetic lab textures only; no human attack dataset. Do not imply universal robustness. |
| You made an extractor. | Defence-only UI, consent gate, no crop/template export, report strips minutiae. | Native source necessarily includes a matcher/extractor; dual-use is acknowledged. |
| The interface is confusing. | Real browser scan→smudge→comparison→download test, responsive/mobile audit, keyboard loupe and comparison slider. | No five-person hallway study. |
| The privacy counter is incomplete. | UI explicitly says it observes resource timing. E2E catches all page requests in tested flows and runs offline. Header readout displays actual missing/delivered policies. | Browser/OS/extension telemetry and side channels outside scope. Header presence alone does not prove enforcement. |
| You calibrated on synthetic data. | We did not. Threshold40 is labelled provisional everywhere; 66 synthetic impostor pairs are too few for FMR0.1%. | Human consented calibration is required before efficacy claims. |
| It can miss a print. | Auto proposals require review; manual regions, numeric adjustments, and a no-hands state are available. Back-of-hand regions are never declared safe automatically. | Detection recall/precision not measured on people. |
| Novelty is overstated. | Prior finger-selfie anonymization is credited; a shipped local inspection/verification workflow is the implementation goal. | No claim to invent biometric anonymization or prove worldwide novelty. |
| Competition readiness. | README, setup, screenshots, source and measured evidence are supplied, plus submission/video materials. | Builder must review eligibility, obtain human consent where used, publish the chosen video, and perform final Devpost submission. |
