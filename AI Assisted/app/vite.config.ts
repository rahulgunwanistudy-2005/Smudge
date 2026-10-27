import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
export default defineConfig({plugins:[sveltekit({preprocess:vitePreprocess(),adapter:adapter(),csp:{mode:'hash',directives:{
 'default-src':['self'],'script-src':['self','wasm-unsafe-eval'],'style-src':['self','unsafe-inline'],
 'img-src':['self','blob:','data:'],'connect-src':['self'],'worker-src':['self','blob:'],
 'object-src':['none'],'base-uri':['none'],'form-action':['self']
}}})],server:{host:'127.0.0.1',port:4317,strictPort:true},build:{target:'es2022'}});
