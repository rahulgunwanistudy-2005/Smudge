/* Replacement for libfprint's nbis-helpers.h (overflow assertions), glib-free. */
#include <glib.h>

#define ASSERT_SIZE_MUL(a,b)                          \
	{                                             \
		gsize dest;                           \
		g_assert(g_size_checked_mul(&dest, a, b)); \
	}

#define ASSERT_INT_MUL(a, b)                          \
	{                                             \
		gsize dest;                           \
		g_assert(g_size_checked_mul(&dest, a, b)); \
		g_assert(dest < G_MAXINT);            \
	}
