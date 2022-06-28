<script context="module" lang="ts">
   export const prerender = true
</script>

<script lang="ts">
   //import Counter from '$lib/Counter.svelte';
   import Typewriter from 'svelte-typewriter'
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import type { AnyWallet } from '$lib/functions/walletUtils'

   const { getWallet, subscribe } = useWalletConnector()

   let wallet: AnyWallet = getWallet()
   subscribe((c) => (wallet = c?.[0]))
</script>

<svelte:head>
   <title>AdaMint | Welcome</title>
</svelte:head>

<section class="flex flex-col items-center w-screen p-4 xs:p-6 gap-3 xs:gap-7 ">
   <span class="text-2xl xs:text-5xl text-center text-slate-400">welcome to</span>
   <span class="text-4xl xs:text-7xl text-center text-blue-700">AdaMint</span>
   <span class="text-lg xs:text-2xl text-center text-slate-500">
      for <a class="text-blue-700" target="_blank" href="https://cardano.org">Cardano</a>
      by <a class="text-violet-800" target="_blank" href="https://www.astroswap.app">AstroSwap</a>
   </span>
   <!-- <a
      class="h-36 xs:h-56 text-3xl xs:text-6xl text-slate-700 max-w-xl w-full align-left"
      href="about"
   > -->
   <a
      class="h-36 xs:h-56 text-3xl xs:text-6xl text-slate-700 max-w-xl w-full text-center"
      href="about"
   >
      <Typewriter loopRandom>
         <h1>Mint verifiably secure tokens</h1>
         <h1>Mint NFTs free of charge</h1>
         <h1>Mint your NFT collection</h1>
         <h1>Mint tokens free of charge</h1>
         <h1>Mint tokens for a project</h1>
         <h1>Mint tokens for the own currency</h1>
         <h1>Mint tokens as a promotional tool</h1>
         <h1>Mint tokens for a coupon drop</h1>
         <h1>Mint tokens to share with friends</h1>
         <h1>Mint tokens for the blockchain bridge</h1>
         <h1>Mint tokens for the airdrop</h1>
         <h1>Mint tokens for a smart contract</h1>
         <h1>Mint tokens to sell as tickets</h1>
         <h1>Mint tokens as a single-use voucher</h1>
         <h1>Mint tokens with a dynamic supply</h1>
         <h1>Mint tokens to show off</h1>
      </Typewriter>
   </a>
   <div class="w-full text-center">
      {#if !wallet}
         <a class="py-2 text-xl xs:text-2xl origin-top text-slate-500" href="#connect">
            connect your wallet and start now
         </a>
      {:else}
         <a class="text-xl xs:text-2xl origin-top text-slate-700" href="/mint"
            >what are we building today?</a
         >
      {/if}
   </div>
</section>
