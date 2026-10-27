# ADR-005: Test the exact exported file

Status: accepted. Date: 2026-10-27 India.

Per-region JPEG attacker variants are insufficient to assert the downloaded photo behaves identically. After region composition and optional reviewed identifier masking, the worker encodes one full JPEG at quality0.95, decodes it, and re-extracts/matches every region from those exact decoded pixels. This score is listed as Exact exported JPEG. Similarity and PSNR also compare the actual exported pixels against the original. The main thread downloads the worker's Blob without another encode.

The masking property only applies before JPEG encoding: recompression changes unmasked pixels. Export quality is fixed at0.95; quantization-table estimation of input quality is not implemented. Source images' metadata is never copied to the new encode.
