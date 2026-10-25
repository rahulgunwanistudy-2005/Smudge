/*
 * nbis_glue.c — thin, allocation-safe wrappers around NIST NBIS.
 *
 * mindtct: get_minutiae() with the stock LFS V2 parameters, converted to
 *          NIST XYT exactly as the NBIS `mindtct` CLI writes .xyt files.
 * bozorth3: the same load/prune/sort steps as the NBIS `bozorth3` CLI
 *          (bz_load + bz_prune), then bozorth_probe_init/bozorth_to_gallery.
 */
#include <math.h>
#include <stdlib.h>
#include <string.h>

#include <lfs.h>
#include <bozorth.h>

#include "smudge.h"

/* NBIS NFIQ-1 reliability thresholds (nfiq.c, comp_nfiq_featvctr). */
static const float k_rel_thresh[5] = {0.5f, 0.6f, 0.75f, 0.8f, 0.9f};

int sm_mindtct(const uint8_t *img, int w, int h, float ppi, SmMinutia *out,
               int max_out, float *feats, int *qhist) {
  MINUTIAE *minutiae = NULL;
  int *quality_map = NULL, *direction_map = NULL, *low_contrast_map = NULL;
  int *low_flow_map = NULL, *high_curve_map = NULL;
  int map_w = 0, map_h = 0;
  unsigned char *bdata = NULL;
  int bw, bh, bd;
  double ppmm = (ppi > 0 ? ppi : SM_WORK_PPI) / 25.4;

  if (w < 64 || h < 64) return -1;

  /* get_minutiae may modify its input; work on a copy. */
  unsigned char *copy = (unsigned char *)malloc((size_t)w * h);
  if (!copy) return -2;
  memcpy(copy, img, (size_t)w * h);

  int r = get_minutiae(&minutiae, &quality_map, &direction_map,
                       &low_contrast_map, &low_flow_map, &high_curve_map,
                       &map_w, &map_h, &bdata, &bw, &bh, &bd, copy, w, h, 8,
                       ppmm, &g_lfsparms_V2);
  free(copy);
  if (r) return r < 0 ? r : -r;

  int n = minutiae->num < max_out ? minutiae->num : max_out;
  for (int i = 0; i < n; i++) {
    MINUTIA *m = minutiae->list[i];
    int nx, ny, nt;
    lfs2nist_minutia_XYT(&nx, &ny, &nt, m, w, h);
    out[i].x = (float)m->x;
    out[i].y = (float)m->y;
    out[i].nx = nx;
    out[i].ny = ny;
    out[i].nt = nt;
    out[i].reliability = (float)m->reliability;
    out[i].type = m->type;
    /* NIST theta: degrees CCW from east with y up. Image y points down. */
    out[i].angle = (float)(-nt * M_PI / 180.0);
  }

  if (feats || qhist) {
    int hist[5] = {0, 0, 0, 0, 0};
    for (int i = 0; i < map_w * map_h; i++) {
      int q = quality_map[i];
      if (q >= 0 && q <= 4) hist[q]++;
    }
    int foreground = map_w * map_h - hist[0];
    if (qhist) memcpy(qhist, hist, sizeof(hist));
    if (feats) {
      int rel_bins[5] = {0, 0, 0, 0, 0};
      for (int i = 0; i < minutiae->num; i++)
        for (int t = 0; t < 5; t++)
          if (minutiae->list[i]->reliability > k_rel_thresh[t]) rel_bins[t]++;
      feats[0] = (float)foreground;
      feats[1] = (float)minutiae->num;
      for (int t = 0; t < 5; t++) feats[2 + t] = (float)rel_bins[t];
      for (int q = 1; q <= 4; q++)
        feats[6 + q] = foreground > 0 ? hist[q] / (float)foreground : 0.0f;
    }
  }

  free_minutiae(minutiae);
  free(quality_map);
  free(direction_map);
  free(low_contrast_map);
  free(low_flow_map);
  free(high_curve_map);
  free(bdata);
  return n;
}

/* bz_load()-equivalent: prune to the best `max_minutiae` by quality, sort by
 * x then y, and fold theta into (-180, 180]. */
static void load_xyt(const int *xytq, int n, struct xyt_struct *s) {
  struct minutiae_struct c[SM_MAX_MINUTIAE];
  int quality[SM_MAX_MINUTIAE], order[SM_MAX_MINUTIAE];
  const int max_minutiae = DEFAULT_BOZORTH_MINUTIAE;
  if (n > SM_MAX_MINUTIAE) n = SM_MAX_MINUTIAE;

  int keep = n;
  if (n > max_minutiae) {
    for (int i = 0; i < n; i++) quality[i] = xytq[i * 4 + 3];
    sort_order_decreasing(quality, n, order);
    keep = max_minutiae;
  } else {
    for (int i = 0; i < n; i++) order[i] = i;
  }
  for (int j = 0; j < keep; j++) {
    const int *m = &xytq[order[j] * 4];
    c[j].col[0] = m[0];
    c[j].col[1] = m[1];
    c[j].col[2] = m[2] > 180 ? m[2] - 360 : m[2];
    c[j].col[3] = m[3];
  }
  qsort(c, (size_t)keep, sizeof(struct minutiae_struct), sort_x_y);
  memset(s, 0, sizeof(*s));
  for (int j = 0; j < keep; j++) {
    s->xcol[j] = c[j].col[0];
    s->ycol[j] = c[j].col[1];
    s->thetacol[j] = c[j].col[2];
  }
  s->nrows = keep;
}

int sm_bozorth(const int *probe_xytq, int np, const int *gallery_xytq,
               int ng) {
  static struct xyt_struct p, g;
  load_xyt(probe_xytq, np, &p);
  load_xyt(gallery_xytq, ng, &g);
  if (p.nrows < MIN_COMPUTABLE_BOZORTH_MINUTIAE ||
      g.nrows < MIN_COMPUTABLE_BOZORTH_MINUTIAE)
    return 0;
  int probe_len = bozorth_probe_init(&p);
  return bozorth_to_gallery(probe_len, &p, &g);
}

int sm_sizeof_minutia(void) { return (int)sizeof(SmMinutia); }
int sm_sizeof_info(void) { return (int)sizeof(SmPrintInfo); }
const char *sm_version(void) { return "smudge-core 1.0 (NBIS mindtct+bozorth3 via libfprint 1.94.7)"; }
