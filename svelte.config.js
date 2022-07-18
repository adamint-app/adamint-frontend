import adapter from '@sveltejs/adapter-auto'
import sequential from 'svelte-sequential-preprocessor'
import sveltePreprocess from 'svelte-preprocess'
import importAssets from 'svelte-preprocess-import-assets'
import svelteImage from 'svelte-image'
import {markdown} from 'svelte-preprocess-markdown'
//import wasmPack from 'vite-plugin-wasm-pack'
import { vitePluginCommonjs } from 'vite-plugin-commonjs'
import vitePluginWasm from 'vite-plugin-wasm'
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
// import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
   // Consult https://github.com/sveltejs/svelte-preprocess
   // for more information about preprocessors
   preprocess: sequential([
      markdown(),
      sveltePreprocess({
         aliases: {
            '$assets': 'src/lib/assets',
            '$lib': 'src/lib'
         },
      }),
      importAssets(),
      svelteImage(),
   ]),
   extensions: ['.svelte', '.md'],
   kit: {
      adapter: adapterCloudflare(), // adapter(),
      methodOverride: {
         allowed: ['PATCH', 'DELETE']
      },
      // vite: {
      //    build: {
      //       target: "esnext"
      //    },
      //    resolve: {
      //       alias: {
      //          '$assets': path.resolve('src/lib/assets'),
      //          '$lib': path.resolve('src/lib'),
      //          //'@apollo/client/core': '@apollo/client/core/core.cjs'
      //          //'svelte-apollo': '/node_modules/svelte-apollo/dist/svelte-apollo.es.js'
      //       }
      //    },
      //    extensions: ['.wasm'],
      //    // https://benw.is/using-wasm-in-sveltekit
      //    plugins: [//wasmPack([], ['$lib/../../node_modules/cardano-serialization-lib']),
      //       vitePluginCommonjs(),
      //       vitePluginWasm(),
      //       // topLevelAwait.default()
      //    ],
      //    optimizeDeps: {
      //       exclude: [],
      //       esbuildOptions:{
      //         plugins:[
      //          //vitePluginCommonjs(['@apollo/client']) 
      //         ]
      //       },
      //       //include: ['@apollo/client']
      //    },
      //    ssr: {
      //       external: [],
      //       noExternal: ['@apollo/client', 'svelte-apollo-client'],
      //    }
      // }
   },
	// experimental: {
	// 	prebundleSvelteLibraries: true
	// }
   // experimental: {
   //    useVitePreprocess: true
   // }
}

export default config
