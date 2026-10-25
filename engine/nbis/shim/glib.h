/* Minimal glib replacement so the libfprint copy of NBIS builds without glib.
 * Only the handful of symbols NBIS actually uses are provided. */
#ifndef SMUDGE_GLIB_SHIM_H
#define SMUDGE_GLIB_SHIM_H
#include <stdlib.h>
#include <stddef.h>
#include <stdint.h>
#include <limits.h>
#include <assert.h>

typedef size_t gsize;
typedef int gint;
typedef int gboolean;
typedef void *gpointer;

#define G_MAXINT INT_MAX
#ifndef TRUE
#define TRUE 1
#endif
#ifndef FALSE
#define FALSE 0
#endif

static inline void *smudge_xmalloc(size_t n) {
  void *p = malloc(n ? n : 1);
  if (!p) abort();
  return p;
}
static inline void *smudge_xrealloc(void *p, size_t n) {
  void *q = realloc(p, n ? n : 1);
  if (!q) abort();
  return q;
}
static inline int g_size_checked_mul(gsize *dest, gsize a, gsize b) {
  if (a != 0 && b > SIZE_MAX / a) return 0;
  *dest = a * b;
  return 1;
}

#define g_malloc(n) smudge_xmalloc(n)
#define g_malloc0(n) calloc(1, (n) ? (n) : 1)
#define g_realloc(p, n) smudge_xrealloc((p), (n))
#define g_free(p) free(p)
#define g_assert(e) do { if (!(e)) abort(); } while (0)
#define g_warning(...) ((void)0)

#endif
