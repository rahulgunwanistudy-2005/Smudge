.PHONY: app wasm native eval independent test check build preview
app:
	npm run dev
wasm:
	npm run build:wasm
native:
	npm run build:native
eval: native
	npm run eval
independent: native
	npm run eval:independent
test:
	npm test
check:
	npm run check
build:
	npm run build
preview:
	npm run preview
