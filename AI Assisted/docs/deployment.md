# Deployment

The authorized destination is Render My Workspace. The delivery uses its free Node web-service plan to serve built static files and attach the complete response policies; user photos are never posted to this server. A free instance may sleep and take time to wake after inactivity. No database, disk, paid plan or remote inference is provisioned.

- Repository: https://github.com/rahulgunwanistudy-2005/Smudge
- Branch: main
- Build: `npm ci --include=dev && npm run build`
- Start: `node 'AI Assisted/scripts/serve.mjs'`
- Environment: NODE_VERSION=24, HOST=0.0.0.0, SKIP_INSTALL_DEPS=true
- Port: platform PORT; local default4318
- Expected verification: header HEAD response, loading self-hosted WASM/model, full scan/export, offline reload after caching, no external requests.

Only GET/HEAD static requests are accepted; other methods return405. Share Target POST is handled by the installed browser service worker, not by this server. The server is not an institutional batch processor.

Vercel and Cloudflare-compatible header files are also generated. Do not deploy a host that silently drops headers and then claim they are active; the UI displays what it actually receives.
