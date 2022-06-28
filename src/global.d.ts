import type { CardanoWasm } from "$lib/types/cardano/wasm";

// declare interface Window {
//    cardanoWasm: CardanoWasm
// }

declare global {
   // interface Window {
   //    cardanoWasm: CardanoWasm
   // }
   // eslint-disable-next-line no-var
   var cardanoWasm: CardanoWasm

   interface ImportMetaEnv {
      VITE_NFT_STORAGE_TOKEN: string
   }
}

// declare var cardanoWasm: CardanoWasm