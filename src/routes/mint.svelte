<script lang="ts">
   import ImageSelectPreview from '$lib/components/imageSelectPreview.svelte'
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import { cardanoParams } from '$lib/functions/cardanoConstants'
   import type { UiFtParams } from '$lib/functions/transactions/mintFt'
   import { mintNft, type UiNftParams } from '$lib/functions/transactions/mintNft'
   import { mintFt } from '$lib/functions/transactions/mintFt'
   import type { AnyWallet } from '$lib/functions/walletUtils'
   import Awesome from 'svelte-awesome'
   import { star, remove, times, close, timesCircle } from 'svelte-awesome/icons'
   import { ScaleOut } from 'svelte-loading-spinners'
   import Input from '$lib/components/nm/input.svelte'
   import PromiseResult from '$lib/components/promiseResult.svelte'
   import Switch from '$lib/components/nm/switch.svelte'

   function pushFiles(files: FileList) {
      if (token.type === 'nft') {
         if (!token.files) {
            token.files = []
         }
         token.files.push(
            ...Array.from(files).map((file) => ({
               name: file.name,
               mediaType: file.type,
               src: file
            }))
         )
         token.files = token.files
      }
   }
   function removeFileAt(i: number) {
      if (token.type === 'nft' && token.files) {
         token.files.splice(i, 1)
         token.files = token.files
      }
   }
   const iconSizes = ['16', '32', '48', '64', '96', '128']
   function updateDefaultIcon(size: string) {
      if (token.type === 'ft') {
         if (token.icons[size]) {
            if (!token.icon) {
               token.icon = size
            }
         } else {
            delete token.icons[size]
            token.icon = Object.keys(token.icons)[0]
         }
      }
   }
   const cardanoMaxTokens = Math.pow(2, 64) - 1
   let token: UiFtParams | UiNftParams = {
      type: 'ft',
      name: '',
      ticker: '',
      url: '',
      desc: '',
      icon: null,
      icons: {},
      decimals: 6,
      supply: 1000000,
      mintControlUTxO: true
   }
   $: maxSupply =
      token.type === 'ft' ? Math.floor(cardanoMaxTokens / Math.pow(10, token.decimals)) : 0
   const { getWallet, getWalletClass, getTransactionClass, subscribe } = useWalletConnector()

   let wallet: AnyWallet = getWallet()
   subscribe((c) => (wallet = c?.[0]))
   let txPromise = Promise.reject<string>()
   let txRunning = false
</script>

<svelte:head>
   <title>AdaMint | Mint</title>
</svelte:head>

<!-- content-center -->
{#if wallet}
   <div class="flex flex-wrap justify-center max-w-3xl self-center text-sm xs:text-base">
      <!-- <div class="sm:w-1/6 md:w-1/4 w-0" /> -->
      <div class="w-full m-3 max-w-sm text-center rounded-2xl nm-flat-slate-100 flex">
         <label
            class="w-full p-3 rounded-l-2xl text-slate-400 cursor-pointer whitespace-nowrap"
            class:round-selected={token.type === 'ft'}
         >
            Simple token
            <input class="hidden" type="radio" value="ft" bind:group={token.type} />
         </label>
         <label
            class="w-full p-3 rounded-r-2xl text-slate-400 cursor-pointer"
            for="type"
            class:round-selected={token.type === 'nft'}
         >
            NFT
         </label>
         <input class="hidden" type="radio" value="nft" id="type" bind:group={token.type} />
      </div>
      <!-- <div class="sm:w-1/6 md:w-1/4 w-0" /> -->
      {#if token.type === 'ft'}
         <Input class="w-full sm:w-1/2" label="Name" for="name">
            <input type="text" id="name" bind:value={token.name} />
         </Input>
         <Input class="w-full sm:w-1/2" label="Ticker" for="ticker">
            <input type="text" id="ticker" bind:value={token.ticker} />
         </Input>
         <Input class="w-full sm:w-1/2" label="Decimals" for="decimals">
            <input type="number" id="decimals" bind:value={token.decimals} min="0" max="18" />
         </Input>
         <Input class="w-full sm:w-1/2" label="Initial supply" for="supply">
            <input type="number" id="supply" bind:value={token.supply} min="1" max={maxSupply} />
         </Input>
         <Input class="w-full sm:w-1/2" label="Project URL" for="url">
            <input type="text" id="url" bind:value={token.url} min="0" max="18" />
         </Input>
         <Input class="w-full sm:w-1/2" label="Description" for="desc">
            <input type="text" id="desc" bind:value={token.desc} min="0" max="18" />
         </Input>
         <div
            class="w-full sm:w-1/2 px-4 py-2 flex flex-row place-items-center justify-start gap-12 xs:gap-16"
         >
            <span class="text-slate-600 ">Supply</span>
            <Switch
               bind:value={token.mintControlUTxO}
               color="bg-slate-100"
               highlight="#FFFFFF"
               shadow="#CBDAE9"
               width="165px"
               indicatorWidth="80px"
            >
               <span slot="on">unlocked</span>
               <span slot="off">locked</span>
            </Switch>
         </div>
         <div class="hidden sm:block w-1/2"><div /></div>
         <div class="w-full p-3">
            <span class="text-slate-600 whitespace-nowrap">Icon variants</span>
            <div class="-mx-2 py-3 flex flex-wrap">
               {#each iconSizes as size}
                  {@const sizeName = 'x' + size}
                  <div class="w-1/4 sm:w-1/6 border-8 xs:border-16 border-transparent">
                     <span class="relative">
                        <ImageSelectPreview
                           class="rounded-md aspect-square"
                           bind:value={token.icons[size]}
                           on:change={() => updateDefaultIcon(size)}
                        >
                           <div class="text-lg xs:text-2xl text-slate-600">
                              {sizeName}
                           </div>
                        </ImageSelectPreview>
                        {#if token.icons[size]}
                           <label
                              class="relative cursor-pointer text-sm bottom-7 -mb-7 xs:text-lg xs:-mb-9 xs:bottom-9 p-1 xs:px-2 rounded-b-md text-slate-50 bg-black bg-opacity-20 flex items-center justify-between"
                              >{sizeName}
                              {#if token.icon === size}
                                 <Awesome data={star} scale={1} />
                              {/if}
                              <!-- xs:ml-3 xs:p-2 -->
                              <input
                                 class="hidden"
                                 type="radio"
                                 value={size}
                                 bind:group={token.icon}
                              />
                           </label>
                        {/if}
                     </span>
                  </div>
               {/each}
            </div>
         </div>
      {:else if token.type === 'nft'}
         <Input class="w-full sm:w-1/2" label="Name" for="name">
            <input type="text" id="name" bind:value={token.name} />
         </Input>
         <Input class="w-full sm:w-1/2" label="Description" for="description">
            <input type="text" id="description" bind:value={token.description} />
         </Input>
         <div class="w-full sm:w-1/2 margin-border flex flex-col">
            <ImageSelectPreview class="rounded-2xl" bind:value={token.image}>
               <div class="p-3 text-slate-600">Choose image...</div>
            </ImageSelectPreview>
         </div>
         <div class="w-full sm:w-1/2 margin-border flex flex-col gap-3">
            {#if token.files}
               <!-- Page reloads on file removal unless #each (key) is specified -->
               {#each token.files as file, i (file.name)}
                  <div class="flex flex-row rounded-lg nm-inset-slate-100-xs">
                     <input
                        class="rounded-l-lg ring-transparent border-0 py-3 flex-auto min-w-0 nm-inset-slate-100 focus:nm-inset-slate-50"
                        type="text"
                        bind:value={token.files[i].name}
                     />
                     <button
                        class="text-center min-w-fit px-3 xs:px-6"
                        on:click={() => removeFileAt(i)}>X</button
                     >
                  </div>
               {/each}
            {/if}
            <label
               class="rounded-2xl p-3 nm-flat-slate-100 text-slate-600 text-center cursor-pointer"
            >
               Add file...
               <input
                  class="hidden"
                  type="file"
                  multiple
                  on:change={(e) => pushFiles(e.target.files)}
               />
            </label>
         </div>
      {/if}
      <button
         class="form-item max-w-sm"
         disabled={txRunning}
         on:click={() =>
            (txPromise =
               token.type === 'ft'
                  ? mintFt(wallet, getWalletClass(), getTransactionClass(), token, cardanoParams)
                  : mintNft(wallet, getWalletClass(), getTransactionClass(), token, cardanoParams))}
      >
         {#if txRunning}
            <div class="flex flex-nowrap justify-center items-center gap-3">
               <div class="-m-2"><ScaleOut size="32" color="blue" /></div>
               Minting...
            </div>
         {:else}
            MINT
         {/if}
      </button>
      <PromiseResult bind:txPromise bind:txRunning let:result let:error let:resetTxPromise>
         <span slot="success" class="w-full flex flex-row justify-center">
            <div class="mt-2 pl-4 rounded-2xl bg-green-300 flex flex-row gap-4 place-items-center">
               <a target="_blank" href="https://cardanoscan.io/transaction/{result}">
                  Success! Open on Cardanoscan
               </a>
               <button class="p-2 m-0" on:click={resetTxPromise}>
                  <Awesome data={timesCircle} scale={1.5} />
               </button>
            </div>
         </span>
         <span slot="error" class="w-full flex flex-row justify-center">
            <div class="mt-2 pl-4 rounded-2xl bg-orange-300 flex flex-row gap-4 place-items-center">
               Error occured: {error.info ?? error}
               <button class="p-2 m-0" on:click={resetTxPromise}>
                  <Awesome data={timesCircle} scale={1.5} />
               </button>
            </div>
         </span>
      </PromiseResult>
   </div>
{:else}
   <div class="pt-28">
      <a class="text-slate-500 text-xl xs:text-3xl" href="#connect">connect your wallet to start</a>
   </div>
{/if}

<style lang="scss">
   .form-item {
      @apply basis-full p-3 m-3 rounded-2xl nm-flat-slate-100;
   }
   .round-selected {
      @apply nm-concave-slate-50-none text-black;
   }
   input:checked + label {
      @apply nm-concave-slate-50-none text-black;
   }
   // .text-input {
   // 	//background-color: theme('colors.slate.50');
   // 	@apply ring-slate-50 bg-slate-50 outline-none rounded-r-lg flex-auto min-w-0 nm-inset-slate-50;
   // 	border: 0em;
   // }
   .nm-input-group {
      @apply flex flex-row items-stretch rounded-2xl nm-inset-slate-100-xs;
   }
   .nm-input-group > label {
      @apply text-slate-600 whitespace-nowrap flex-none;
   }
   .nm-input-group > input {
      //background-color: theme('colors.slate.50');
      @apply ring-slate-50 w-full min-w-0 outline-none rounded-r-lg nm-inset-slate-100;
      border: 0em;
   }
   .nm-input-group > input:focus {
      @apply nm-inset-slate-50/* nm-inset-white*/;
   }
   .margin-border {
      border: 0.5rem solid transparent;
   }
</style>
