import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
export default { preprocess: vitePreprocess(), kit: { adapter: adapter(), csp: { mode: 'hash', directives: {
  'default-src': ['self'], 'script-src': ['self', 'wasm-unsafe-eval'], 'style-src': ['self', 'unsafe-inline'],
  'img-src': ['self', 'blob:', 'data:'], 'connect-src': ['self'], 'worker-src': ['self', 'blob:'],
  'object-src': ['none'], 'base-uri': ['none'], 'form-action': ['self']
} } } };
