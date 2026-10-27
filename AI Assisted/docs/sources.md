# Sources (verified 2026-10-25)

This table was inherited from the initial scaffold. The current build re-verified the Vizo palette, competition deadline/requirements, Connection Allowlist syntax, SourceAFIS documentation, CCC2014 announcement, current SvelteKit migration, and Render deployment docs. Other historical entries below remain carried-forward references; they are not presented as newly re-verified claims in the UI. The "Why this matters" screen links to the same URLs.

| Year | Claim used in the app | Source |
|---|---|---|
| 2014 | A CCC member (Jan "Starbug" Krissler) said he reproduced German defence minister Ursula von der Leyen's thumbprint from press-conference photos taken about 3 m away. | BBC News, 29 Dec 2014 — https://www.bbc.com/news/technology-30623611 ; CCC announcement — https://www.ccc.de/en/updates/2014/ursel ; Ars Technica — https://arstechnica.com/information-technology/2014/12/politicians-fingerprint-reproduced-using-photos-of-her-hands/ |
| 2017 | Japan's National Institute of Informatics (Prof. Isao Echizen) warned that peace-sign photos taken ~3 m away can leak fingerprints. | BBC Newsbeat, 11 Jan 2017 — https://www.bbc.com/news/newsbeat-38582734 ; phys.org/AFP — https://phys.org/news/2017-01-japan-fingerprint-theft-peace.html |
| 2021 | Merseyside Police identified a drug dealer from his palm and fingerprints in an EncroChat photo of him holding Stilton cheese. | BBC News, 24 May 2021 — https://www.bbc.co.uk/news/uk-england-merseyside-57226165 |
| 2024 | India's Minister of State for Finance told the Rajya Sabha that AePS frauds are "most often due to compromise of Aadhaar number and fingerprint biometrics from … mainly land / property registration records." MHA told a parliamentary panel that "dummy fingers or rubber fingers" were being used. | Rajya Sabha Unstarred Q 872, 30 Jul 2024 (via MediaNama) — https://www.medianama.com/wp-content/uploads/2024/07/annex_265_AU872_rrkEnN.pdf ; MediaNama — https://www.medianama.com/2024/07/223-aadhaar-breaches-in-land-records-behind-aeps-fraud-surge/ ; PIB, 31 Jul 2024 — https://www.pib.gov.in/PressReleasePage.aspx?PRID=2039647 ; Hindustan Times, 10 Feb 2024 — https://www.hindustantimes.com/india-news/aeps-frauds-using-dummy-fingers-on-rise-mha-tells-parliamentary-panel-101707569008404.html |
| 2026 | A Chinese TV segment showed AI-assisted fingerprint extraction from a celebrity selfie (within ~1.5 m); Germany's BSI warned that peace-sign photos plus AI tools can be used to recreate fingerprints. | SCMP, 10 May 2026 — https://www.scmp.com/news/people-culture/trending-china/article/3352777/china-tv-variety-show-exposes-scam-linking-peace-sign-selfies-privacy-risks ; Korea Herald, 13 May 2026 — https://www.koreaherald.com/article/10737302 ; GovInfoSecurity on BSI — https://www.govinfosecurity.com/german-cyber-agency-warns-fingerprints-be-spoofed-a-32643 |
| 2026 (counterpoint) | Security researchers told CBS that for the average person the risk is low and an attacker still needs the physical scanner. We show this too: Smudge is cheap insurance, not a panic button. | CBS News, 1 Jun 2026 — https://www.cbsnews.com/news/hackers-fingerprints-selfie-photo-ai-experts/ |

## Platform

| Item | Source |
|---|---|
| Chrome 152 ships Connection Allowlists (25 Aug 2026) | https://developer.chrome.com/blog/new-in-chrome-152 |
| Connection Allowlists explainer / origin trial | https://developer.chrome.com/blog/connection-allowlists-origin-trial |
| Spec (WICG draft, 6 Oct 2026) | https://wicg.github.io/connection-allowlists/ |
| NIST NBIS | https://www.nist.gov/services-resources/software/nist-biometric-image-software-nbis |
| NBIS user guide (NISTIR 7392) | https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir7392.pdf |

## Prior art (read for the novelty check)

| Work | Link |
|---|---|
| Malhotra et al., "On privacy preserving anonymization of finger-selfies", CVPRW 2020 | https://mlanthology.org/cvprw/2020/malhotra2020cvprw-privacy/ |
| Perceptual noise injection against fingerprint extraction (IEEE TIP 2024, arXiv 2208.10688) | https://arxiv.org/html/2208.10688 |
| "Privacy-Aware Fingerprint Exposure Detection in Photographs" (Zenodo) | https://zenodo.org/records/22049886 |

## Current build additions

- SvelteKit3 migration: https://svelte.dev/docs/kit/migrating-to-sveltekit-3
- SourceAFIS Java API/licence: https://sourceafis.machinezoo.com/java
- ESPCN source/model/licence: https://github.com/fannymonori/TF-ESPCN (downloaded model and Apache2.0 licence; graph hash in independent.json).
- OpenCV DNN super-resolution API: https://docs.opencv.org/4.13.0/d9/de0/group__dnn__superres.html
- Render current plans/free hosting/deploy lifecycle: https://render.com/docs/compute-plans ; https://render.com/docs/free ; https://render.com/docs/deploys
- Corrected and verified CVF workshop landing page (workshop1, not workshop48): https://openaccess.thecvf.com/content_CVPRW_2020/html/w1/Malhotra_On_Privacy_Preserving_Anonymization_of_Finger-Selfies_CVPRW_2020_paper.html . The paper studies adversarial anonymization; Smudge uses a distinct signal-suppression prototype and does not claim original invention of this problem.
