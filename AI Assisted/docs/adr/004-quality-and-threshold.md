# ADR-004: Explicitly provisional measurements

Status: accepted. Date: 2026-10-27 India.

The scaffold contains mindtct and Bozorth3 but not the trained NFIQ model. The eleven NFIQ-1-style features are extracted from NBIS quality maps; the displayed grade is a monotone heuristic, never called NIST NFIQ. Threshold40 is provisional and is not advertised as FMR0.1% calibration. SourceAFIS adds a second extractor/matcher to synthetic experiments; its independent score scale is not equated numerically with Bozorth3.

Absent human captures, the UI offers labelled procedural specimens with same-image baselines. User-uploaded images without a reference display no match score. All code and evaluation are under AI Assisted; no unverified human authorship or human review is claimed.
