<script context="module" lang="ts">
   import { showCardanoValue, type AnyWallet } from '$lib/functions/walletUtils'
</script>

<script lang="ts">
   // import type { CardanoWalletCIP30Api } from 'src/types/cardanoDAppWallet'
   //var Buffer = require('buffer/').Buffer
   // import { Buffer } from 'buffer'
   // import { getPolicyId, getAssetName } from './cardano-wallet-utils'
   //export let api: CardanoWalletCIP30Api
   // let SS: Promise<CardanoWasm> = import(
   //    '@emurgo/cardano-serialization-lib-asmjs/cardano_serialization_lib.js'
   // )
   //export let S: CardanoWasm
   //import type { WalletConnector, CardanoWasm } from 'src/lib/compositions/walletConnector'
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import ShortAddress from './shortAddress.svelte'
   // import { valueWasmAssets, showValue } from '$lib/functions/wasmUtils'
   const { getWalletClass, getWallet } = useWalletConnector()
</script>

<!-- <svelte:head>
   <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@emurgo/cardano-serialization-lib-asmjs@9.1.3/cardano_serialization_lib_bg.min.js"
      on:load={initializeSerializer}
    ></script> 
</svelte:head>-->

<span>
   <!-- {#await getWalletClass().getBalance(getWallet())}
      Retrieving balance...
   {:then balance}
      Balance: {showCardanoValue(balance)}
   {:catch e}
      Error: {e.message}
   {/await} -->
   <span class="whitespace-nowrap text-slate-500"
      >Connected to {getWalletClass().getName(getWallet())}</span
   >
   {#await getWalletClass().getAddresses(getWallet())}
      <span class="whitespace-nowrap">Retrieving addresses...</span>
   {:then addresses}
      {@const threshold = 5}
      <span class="whitespace-nowrap text-lg">Used addresses:</span>
      <div class="pt-2 flex flex-col items-center gap-2">
         {#each addresses.slice(0, threshold) as address}
            <ShortAddress {address} len={8} />
         {/each}
         {#if addresses.length > threshold}
            ... and others
         {/if}
      </div>
   {:catch e}
      Error: {e.message}
   {/await}
</span>
