/*
 * smudge.h — public C API of the Smudge core.
 *
 * One C library, two builds:
 *   - WebAssembly (Emscripten) for the browser app,
 *   - a native shared library for the Python lab (ctypes).
 * The lab's numbers and the app's behaviour therefore come from the same code.
 *
 * Conventions
 *   - Images are 8-bit grayscale, row-major, top-left origin, stride == width.
 *   - "work scale" is ~500 ppi, the resolution NBIS mindtct is tuned for.
 *   - Orientation angles are radians in [0, pi): the direction ridges run.
 */
#ifndef SMUDGE_H
#define SMUDGE_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define SM_MAX_MINUTIAE 400
#define SM_NFIQ_FEATS 11
#define SM_WORK_PPI 500.0f

typedef struct {
  float x, y;        /* position in the caller's ROI pixel coordinates */
  int nx, ny, nt;    /* NIST XYT at work scale (origin bottom-left, degrees) */
  float reliability; /* mindtct reliability, 0..1 */
  int type;          /* 0 = bifurcation, 1 = ridge ending (NBIS convention) */
  float angle;       /* direction in ROI coordinates, radians */
} SmMinutia;

typedef struct {
  int n_minutiae;     /* all minutiae mindtct reported */
  int n_hq;           /* minutiae with reliability >= SM_HQ_RELIABILITY */
  int polarity;       /* 0 = dark ridges as given, 1 = inverted */
  int work_w, work_h; /* size of the 500 ppi working image */
  float scale;        /* work pixels per ROI pixel */
  float coherent_frac;/* fraction of ROI blocks with coherent ridge flow */
  float mean_coherence;
  float ridge_period; /* median ridge period at work scale (px) */
  int nfiq_style;     /* 1 (best) .. 5 (worst), see docs/adr/004 */
  float nfiq_feats[SM_NFIQ_FEATS]; /* NBIS NFIQ-1 feature vector (unnormalised) */
} SmPrintInfo;

#define SM_HQ_RELIABILITY 0.5f

/* ---------- NBIS wrappers (nbis_glue.c) ---------- */

/* Run NBIS mindtct on an image already at ~500 ppi with dark ridges.
 * Writes up to max_out minutiae; returns count, or <0 on error.
 * feats (optional, 11 floats) receives the NFIQ-1 feature vector;
 * qhist (optional, 5 ints) receives the quality-map histogram. */
int sm_mindtct(const uint8_t *img, int w, int h, float ppi,
               SmMinutia *out, int max_out, float *feats, int *qhist);

/* NBIS bozorth3 match score between two minutia sets given as NIST XYT
 * plus quality (4 ints per minutia: x, y, theta_deg, quality 0..100).
 * Mirrors the bozorth3 CLI: prunes to the best 150 by quality. */
int sm_bozorth(const int *probe_xytq, int np, const int *gallery_xytq, int ng);

/* ---------- Core image processing (smudge_core.c) ---------- */

/* Block orientation field (radians, ridge direction) and coherence.
 * Output arrays are bw*bh where bw = ceil(w/blk), bh = ceil(h/blk). */
void sm_orientation(const uint8_t *img, int w, int h, int blk,
                    float *theta, float *coherence);

/* Ridge period per block (pixels, 0 = unknown) along the block normal. */
void sm_ridge_period(const uint8_t *img, int w, int h, int blk,
                     const float *theta, float *period);

/* Contrast-limited adaptive histogram equalisation. */
void sm_clahe(const uint8_t *in, int w, int h, int tiles_x, int tiles_y,
              float clip, uint8_t *out);

/* Oriented Gabor enhancement. mask (bw*bh, may be NULL) zeroes background.
 * Output: dark ridges on white, ready for mindtct. */
void sm_gabor(const uint8_t *in, int w, int h, int blk, const float *theta,
              const float *period, const uint8_t *mask, uint8_t *out);

/* Separable Lanczos-3 resize. */
void sm_resize(const uint8_t *in, int w, int h, uint8_t *out, int ow, int oh);

/* Unsharp mask: out = in + amount * (in - gauss(in, sigma)). */
void sm_unsharp(const uint8_t *in, int w, int h, float sigma, float amount,
                uint8_t *out);

/* Mean SSIM (Gaussian window sigma 1.5) between two images. */
double sm_ssim(const uint8_t *a, const uint8_t *b, int w, int h);

/* Full analysis of one fingertip ROI, the same path an attacker would take:
 * rescale to 500 ppi, CLAHE, orientation + frequency, Gabor, mindtct —
 * on both ridge polarities, keeping the one that yields more reliable
 * minutiae. roi_ppi is the estimated resolution of the ROI. */
int sm_analyze(const uint8_t *roi, int w, int h, float roi_ppi,
               SmMinutia *out, int max_out, SmPrintInfo *info);

/* Ridge-band suppression ("the smudge") on a luminance ROI.
 * alpha (w*h, 0..255) is the feathered mask; pixels with alpha 0 are copied
 * bit-exactly. strength in [0,1]; band_px_lo/hi bound the ridge periods
 * (in ROI pixels) that are attacked; noise in [0,1] scales skin-texture
 * re-injection. seed makes the noise reproducible. */
void sm_smudge(const uint8_t *y, int w, int h, const uint8_t *alpha,
               float strength, float band_px_lo, float band_px_hi,
               float noise, uint32_t seed, uint8_t *out);

/* Helpers for the WASM side. */
int sm_sizeof_minutia(void);
int sm_sizeof_info(void);
const char *sm_version(void);

#ifdef __cplusplus
}
#endif
#endif
