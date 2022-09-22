// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path'
import { vitePluginCommonjs } from 'vite-plugin-commonjs'
import vitePluginWasm from 'vite-plugin-wasm'
// import topLevelAwait from "vite-plugin-top-level-await";

/** @type {import('vite').UserConfig} */
const config = {
         build: {
            target: "esnext"
         },
         resolve: {
            alias: {
               '$assets': path.resolve('src/lib/assets'),
               '$lib': path.resolve('src/lib'),
               //'@apollo/client/core': '@apollo/client/core/core.cjs'
               //'svelte-apollo': '/node_modules/svelte-apollo/dist/svelte-apollo.es.js'
            }
         },
         extensions: ['.wasm'],
         // https://benw.is/using-wasm-in-sveltekit
         plugins: [//wasmPack([], ['$lib/../../node_modules/cardano-serialization-lib']),
            sveltekit(),
            vitePluginCommonjs(),
            vitePluginWasm(),
            // topLevelAwait()
         ],
         optimizeDeps: {
            exclude: [],
            esbuildOptions:{
              plugins:[
               //vitePluginCommonjs(['@apollo/client']) 
              ]
            },
            //include: ['@apollo/client']
         },
         ssr: {
            external: [],
            noExternal: ['@apollo/client', 'svelte-apollo-client'],
         }
};

export default config;