# Learned super-resolution attacker (lab only)

`ESPCN_x4.pb` is the trained4x ESPCN graph published by Fanny Monori's OpenCV GSoC2019 project: https://github.com/fannymonori/TF-ESPCN/blob/master/export/ESPCN_x4.pb . The repository's Apache2.0 licence is preserved in `ESPCN-LICENSE`.

It is a general image upscaler, not a fingerprint reconstruction model. The lab applies it to already-treated synthetic ridge images, then independently re-extracts and matches with SourceAFIS and NBIS. This extends the attack suite but does not establish robustness to arbitrary AI attackers. It is never downloaded or run by the app. The script writes the graph's exact byte count and SHA256 into `results/independent.json`.

OpenCV's DNN super-resolution API: https://docs.opencv.org/4.13.0/d9/de0/group__dnn__superres.html . Original ESPCN paper: https://arxiv.org/abs/1609.05158 . We do not claim to have trained this model.
