# ADR-002: Static asset delivery with explicit response headers

Status: revised, 2026-10-27 India. Original decision: Vercel static hosting.

The user authorized publication to Render workspace My Workspace. The connected static-site creation tool does not expose custom headers and the dashboard is not signed in. Use Render's free Node web-service plan solely to serve the static SvelteKit output through `scripts/serve.mjs`. There is no image-processing API: only GET and HEAD are accepted. The server binds0.0.0.0 via HOST in production, uses PORT, and attaches CSP hashes from actual production HTML plus Connection-Allowlist, COOP/COEP, no-referrer and Permissions-Policy. No database or disk is provisioned. Free services may sleep and have a cold start; disclose this.

The original `vercel.json` deployment option is retained at repository root. Its response CSP adds restrictions while SvelteKit's meta policy supplies bootstrap hashes and full script directives. `scripts/security-headers.mjs` also generates a complete hash-specific `_headers` file and config for hosts supporting them. Never add unsafe-inline to script-src.

The app's privacy drawer reads actual HEAD response headers. Header delivery is distinct from support/enforcement of Connection Allowlists; no user-agent guess claims support. CSP and the service worker remain separate layers. A resource-timing counter does not prove absence of every possible network channel.
