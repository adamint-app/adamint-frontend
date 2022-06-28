<script context="module" lang="ts">
   // type CardanoNetworkType = 'mainnet' | 'testnet'
   // type CardanoAccount = {}
   // type WalletProvider = {
   //    provider: string
   //    networkType: CardanoNetworkType
   //    account: CardanoAccount
   // }
</script>

<script lang="ts">
   import { scale } from 'svelte/transition'
   import { onMount } from 'svelte'
   import { ScaleOut } from 'svelte-loading-spinners'
   import LetterSvg from '../letterSvg.svelte'
   import DropdownMenu from '../dropdownMenu.svelte'
   import WalletInfo from '$lib/components/cardano/walletInfo.svelte'
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import url from '$lib/compositions/url'
   import {
      type AnyWalletLike,
      type AnyWallet,
      selectTransactionWalletTypeclass
   } from '$lib/functions/walletUtils'
   import {
      fetchConnectors,
      sanitizeWalletName,
      selectWalletTypeclass
   } from '$lib/functions/walletUtils'
   import { init } from 'svelte/internal'
   import type { WalletLike } from '$lib/types/walletLike'
   import type { CardanoWasm } from '$lib/types/cardano/wasm'
   import Loader from '$lib/compositions/Loader'
   import { goto } from '$app/navigation'

   const { getWallet, getWalletClass, setConnector, resetConnector } = useWalletConnector()
   let connectorPromise = getWallet() ? Promise.resolve(getWallet()) : Promise.reject()
   function resetConnectorPromise() {
      connectorPromise = Promise.reject()
   }
   function setConnectorPromise(wallet: Promise<AnyWalletLike>) {
      connectorPromise = wallet
   }
   function updateConnectors(window: Window) {
      items = fetchConnectors(window)
   }
   function constructWalletLike(wallet: AnyWallet): AnyWalletLike {
      switch (wallet.walletType) {
         case 'cip30':
            return wallet
         case 'typhon':
            return wallet
      }
   }
   function setConnectorAsync(wallet: AnyWallet) {
      failed = true
      setConnectorPromise(new Promise(() => {}))
      const walletLike = constructWalletLike(wallet)
      const walletClass = selectWalletTypeclass(wallet)
      const transactionWalletClass = selectTransactionWalletTypeclass(wallet)
      const wasmPromise = window.cardanoWasm
         ? Promise.resolve(window.cardanoWasm)
         : (async () => await import('$lib/../../node_modules/cardano-serialization-lib'))()
      Promise.all([wasmPromise, walletClass.enableWallet(walletLike)])
         .then(async ([wasmInstance, wlt]) => {
            failed = false
            window.cardanoWasm = wasmInstance
            setConnector([wlt, walletClass, transactionWalletClass])
            setConnectorPromise(Promise.resolve(wlt))
         })
         .catch(() => {
            failed = true
            resetConnectorPromise()
         })
   }
   function disconnect() {
      resetConnector()
      resetConnectorPromise()
      updateConnectors(window)
   }
   let items: AnyWallet[] = []
   let failed = false

   onMount(async () => {
      updateConnectors(window)
   })
   const seq = (len: number) => [...Array(Math.ceil(len))].map((_, _i) => 0 + _i * 1)
   const colFrom = (len: number, rows: number) => len / rows
   const rowFrom = (len: number, rows: number, col: number) =>
      (col + 1) * rows <= len ? 3 : len % rows
   const recommendedWallets = [
      ['eternl', 'https://ccvault.io/app/mainnet/news', '/icons/vendors/eternl_wallet.png'],
      ['Flint', 'https://flint-wallet.com', '/icons/vendors/flint_wallet.png'],
      ['Gero', 'https://gerowallet.io', 'https://gerowallet.io/assets/img/logo2.ico'],
      ['Nami', 'https://namiwallet.io', '/icons/vendors/nami_wallet.svg'],
      ['Typhon', 'https://typhonwallet.io/#/', 'https://typhonwallet.io/assets/typhon.svg'],
      [
         'yoroi',
         'https://yoroi-wallet.com/#/',
         'https://yoroi-wallet.com/assets/yoroi-logo-symbol.svg'
      ]
   ]
</script>

{#await connectorPromise}
   <div class="hidden xs:block"><ScaleOut size="48" color="blue" /></div>
   <div class="block xs:hidden"><ScaleOut size="36" color="blue" /></div>
{:then connected}
   {@const icon = getWalletClass().getIcon(connected)}
   {@const name = getWalletClass().getName(connected)}
   <div class="h-9 xs:h-12">
      <DropdownMenu>
         <div slot="dropdown" class="p-1 rounded-xl w-9 xs:w-12 nm-flat-slate-100">
            {#if icon}
               <img class=" aspect-square" src={icon} />
            {:else}
               <LetterSvg letter={name[0]} />
            {/if}
         </div>
         <div
            slot="menu"
            in:scale={{ duration: 200, start: 0.95 }}
            out:scale={{ duration: 150, start: 0.95 }}
            class="origin-top-right right-0 absolute px-4 py-4 mt-3 bg-slate-200
           rounded-2xl flex flex-col items-center gap-5"
         >
            <WalletInfo />
            <button class="p-3 rounded-2xl nm-flat-slate-200" on:click={disconnect}>
               Disconnect
            </button>
         </div>
      </DropdownMenu>
   </div>
{:catch e}
   {#if failed}
      <!-- Failed to connect -->
   {:else}
      <!-- Disconnected -->
   {/if}
   <DropdownMenu show={$url.hash === '#connect'} on:close={() => goto('')}
      ><div slot="dropdown" class="p-2 xs:p-3 rounded-2xl nm-flat-slate-100 whitespace-nowrap">
         <span class="hidden sm:block">Connect wallet</span>
         <span class="block sm:hidden">Wallet</span>
         <span />
      </div>
      <!--
      <div
         slot="menu"
         in:scale={{ duration: 200, start: 0.95 }}
         out:scale={{ duration: 150, start: 0.95 }}
         class="absolute origin-top-right right-0 min-w-max"
      >
         <div
            class="grid grid-cols-3 grid-flow-row items-center gap-5 px-4 py-4 mt-3 bg-slate-200
         rounded-2xl"
         >
            {#each items as wallet}
               <button
                  class="rounded-xl w-16 p-2 nm-flat-slate-200 items-center"
                  on:click={() => setConnectorAsync(wallet)}
               >
                  {#if wallet.icon}
                     <img class="w-10 aspect-square" src={wallet.icon} />
                  {:else}
                     <LetterSvg letter={wallet.name[0]} />
                  {/if}
                  {sanitizeWalletName(wallet.name)}
               </button>
            {/each}
         </div>
      -->
      <div
         slot="menu"
         in:scale={{ duration: 200, start: 0.95 }}
         out:scale={{ duration: 150, start: 0.95 }}
         class="absolute origin-top-right right-0 flex flex-col gap-5 px-4 py-4 mt-3 bg-slate-200
         rounded-2xl"
      >
         {#each seq(colFrom(items.length, 3)) as i}
            <div class="flex flex-row gap-4">
               {#each seq(rowFrom(items.length, 3, i)) as j}
                  {@const wallet = items[i * 3 + j]}
                  <button
                     class="flex flex-col rounded-xl w-16 p-2 nm-flat-slate-200 items-center"
                     on:click={() => setConnectorAsync(wallet)}
                  >
                     {#if wallet.icon}
                        <img class="w-10 aspect-square" src={wallet.icon} />
                     {:else}
                        <LetterSvg letter={wallet.name[0]} />
                     {/if}
                     {sanitizeWalletName(wallet.name)}
                  </button>
               {/each}
            </div>
         {:else}
            <span class="w-60 text-slate-600">
               Looks like you haven't installed any Cardano wallet extensions.
               <br />
               Here are some we do support:
            </span>
            <div class="grid grid-cols-3 gap-4">
               {#each recommendedWallets as [name, href, src]}
                  <a
                     class="py-1 rounded-2xl nm-flat-slate-200 flex flex-col items-center justify-between"
                     target="_blank"
                     {href}
                  >
                     {name}
                     <img class="w-14" {src} />
                  </a>
               {/each}
            </div>
            <a
               class="p-2 rounded-2xl nm-flat-slate-200 text-center"
               target="_blank"
               href="https://www.google.com/search?q=Cardano+wallet+extension"
            >
               browse for more wallets
            </a>
         {/each}
      </div>
   </DropdownMenu>
{/await}
