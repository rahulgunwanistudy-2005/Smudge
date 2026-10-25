# ADR-002: Static hosting on Vercel with security headers in `vercel.json`

- Status: accepted
- Date: 2026-10-25

## Decision
The app is built with SvelteKit `adapter-static` and served by Vercel. Headers are set in `app/vercel.json` (and mirrored in `app/static/_headers` for Cloudflare Pages, so either host works):

```
Connection-Allowlist: (response-origin)
Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:; worker-src 'self' blob:; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=()
```

## Notes
- `Connection-Allowlist` syntax was checked against the WICG draft (6 Oct 2026) and the Chrome 152 release post. `response-origin` adds the serving origin.
- The CSP covers browsers without Connection Allowlists (Safari, Firefox). The Prove-it drawer tells the user which layer is active.
- `script-src` needs a hash or `'unsafe-inline'` for SvelteKit's inline bootstrap. We use SvelteKit's built-in CSP mode (`kit.csp` with `mode: 'hash'`) so the inline script is hashed, not allowed wholesale.
- COOP/COEP make the page cross-origin isolated, which unlocks threaded WASM where available.
