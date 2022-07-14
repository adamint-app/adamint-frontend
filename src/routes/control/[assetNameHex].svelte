<script context="module" lang="ts">
   /** @type {import('./[assetNameHex]').Load} */
   export async function load({ params, fetch, session, stuff }) {
      return {
         props: {
            assetNameHex: params.assetNameHex
         }
      }
   }
</script>

<script lang="ts">
   import AssetPreview from '$lib/components/cardano/assetPreview.svelte'
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import policyFt from '../../../static/cardano/mint-ft-policy.json'
   import policyNft from '../../../static/cardano/mint-nft-policy.json'
   import { ftPolicyId, nftPolicyId } from '$lib/functions/policyIds'
   import { at } from 'svelte-awesome/icons'
   import Switch from '$lib/components/nm/switch.svelte'
   import Input from '$lib/components/nm/input.svelte'
   import InlineDropdown from '$lib/components/inlineDropdown.svelte'
   import { cardanoParams } from '$lib/functions/cardanoConstants'
   import type { MetadataCIP38 } from '$lib/types/cardano/metadata/cip38'
   import type { TokenMetadataPayload } from '$lib/types/cardano/metadata'
   import { burnFt } from '$lib/functions/transactions/burnFt'
   import { fromHex } from '$lib/functions/bytes'
   import PromiseResult from '$lib/components/promiseResult.svelte'
   import Awesome from 'svelte-awesome'
   import { star, remove, times, close, timesCircle } from 'svelte-awesome/icons'
   import type { MetadataCIP25 } from '$lib/types/cardano/metadata/cip25'
   import { ScaleOut } from 'svelte-loading-spinners'

   export let assetNameHex: string
   $: assetName = assetNameHex ? fromHex(assetNameHex) : undefined
   const { subscribe, getWallet, getWalletClass, getTransactionClass } = useWalletConnector()

   let wallet = getWallet()
   let walletClass = getWalletClass()
   subscribe((w) => {
      wallet = w?.[0]
      walletClass = w?.[1]
   })
   let positive = true
   let changeQty = 0
   let cip38: TokenMetadataPayload<MetadataCIP38>
   let cip25: TokenMetadataPayload<MetadataCIP25>

   let txPromise = Promise.reject<string>()
   let txRunning = false
   let runningTx: 'mint' | 'lock' | 'burn'
   const resetRunningTx = () => (runningTx = undefined)
   function pickValue(...conds: boolean[]) {
      return function <T>(...values: T[]) {
         const index = booleanInt(conds)
         return values[index]
      }
   }
   function booleanInt(bools: boolean[]) {
      return bools.reduce((acc, cur) => (acc << 1) + (cur ? 1 : 0), 0)
   }
</script>

<svelte:head>
   <title>AstroMint | {cip25?.name ?? 'Control'}</title>
</svelte:head>

{#if wallet}
   {#await walletClass.getBalance(wallet)}
      <div class="pt-28">
         <span class="text-xl xs:text-3xl text-slate-500">Loading wallet balance...</span>
      </div>
   {:then balance}
      {@const qtyFt = balance.get(ftPolicyId)?.get(assetNameHex)}
      {@const qtyNft = balance.get(nftPolicyId)?.get(assetNameHex)}
      {#if qtyFt && qtyNft}
         <div class="flex flex-col gap-4">
            <div class="w-screen max-w-md -m-2">
               <AssetPreview
                  bind:cip38
                  bind:cip25
                  class="m-2"
                  tokenType="ft"
                  policyId={ftPolicyId}
                  assetName={assetNameHex}
                  qty={qtyFt}
               />
            </div>
            <!-- <p /> -->
            <span class="text-xl xs:text-2xl text-slate-600">Control supply</span>
            <div class="text-slate-700 flex flex-nowrap gap-4">
               <Switch
                  bind:value={positive}
                  color="bg-slate-100"
                  highlight="#FFFFFF"
                  shadow="#CBDAE9"
               >
                  <span slot="on">mint</span>
                  <span slot="off">burn</span>
               </Switch>
               <Input
                  class="max-w-fit -mr-2 -my-2"
                  labelClass="w-20 xs:w-24"
                  label="Quantity"
                  for="qty"
               >
                  <input
                     type="number"
                     id="qty"
                     bind:value={changeQty}
                     min="0"
                     max="1000000000000"
                  />
               </Input>
            </div>
            <button
               class="p-2 rounded-2xl nm-flat-slate-100"
               disabled={txRunning}
               on:click={() => {
                  runningTx = 'mint'
                  txPromise = burnFt(
                     wallet,
                     walletClass,
                     getTransactionClass(),
                     cardanoParams,
                     [
                        {
                           policy: policyFt.cborHex,
                           policyId: ftPolicyId,
                           assetName,
                           qty: changeQty.toString() + '0'.repeat(cip38?.decimals ?? 0),
                           positive
                        }
                     ],
                     [{ policy: policyNft.cborHex, policyId: nftPolicyId, assetName, qty: qtyNft }]
                  ).finally(resetRunningTx)
               }}
            >
               <span>
                  {pickValue(runningTx === 'mint', positive)(
                     'BURN TOKENS',
                     'MINT TOKENS',
                     'Burning tokens...',
                     'Minting tokens...'
                  )}
               </span>
            </button>
            <span class="text-sm text-slate-500 text-center">
               Minting cost does not depend on minted amount
            </span>
            <InlineDropdown>
               <div
                  let:isExpanded
                  slot="button"
                  class="text-xl xs:text-2xl text-slate-600 text-left flex flex-nowrap gap-4"
               >
                  Lock supply
                  <div class:rotate-90={isExpanded}>❯</div>
               </div>
               <div class="flex flex-col gap-4 nm-inset-slate-100 p-4 rounded-3xl">
                  <span class="max-w-fit bg-orange-300 p-2 rounded-2xl">
                     Locking supply will destroy your Control NFT. No one will be able to mint or
                     burn tokens for this currency anymore. No one can restore the Control NFT.
                  </span>
                  <button
                     class="px-4 py-2 rounded-2xl nm-flat-slate-100 w-full"
                     disabled={txRunning}
                     on:click={() => {
                        runningTx = 'lock'
                        txPromise = burnFt(
                           wallet,
                           walletClass,
                           getTransactionClass(),
                           cardanoParams,
                           [
                              {
                                 policy: policyNft.cborHex,
                                 policyId: nftPolicyId,
                                 assetName,
                                 qty: qtyNft,
                                 positive: false
                              }
                           ],
                           []
                        ).finally(resetRunningTx)
                     }}
                  >
                     {#if runningTx === 'lock'}
                        <div class="flex flex-nowrap justify-center items-center gap-3">
                           <div class="-m-2"><ScaleOut size="32" color="blue" /></div>
                           Locking supply...
                        </div>
                     {:else}
                        LOCK SUPPLY
                     {/if}
                  </button>
               </div>
            </InlineDropdown>
            <InlineDropdown>
               <div
                  let:isExpanded
                  slot="button"
                  class="text-xl xs:text-2xl text-slate-600 text-left flex flex-nowrap gap-4"
               >
                  Burn currency
                  <div class:rotate-90={isExpanded}>❯</div>
               </div>
               <div class="flex flex-col gap-4 nm-inset-slate-100 p-4 rounded-3xl">
                  <span class="max-w-fit bg-orange-300 p-2 rounded-2xl">
                     Burning currency will destroy your Control NFT and all tokens of this currency
                     in your wallet. Any tokens of this currency in other wallets will remain, and
                     you won't be able to burn them later. No one can restore the Control NFT.
                  </span>
                  <button
                     class="px-4 py-2 rounded-2xl nm-flat-slate-100 w-full"
                     disabled={txRunning}
                     on:click={() => {
                        runningTx = 'burn'
                        txPromise = burnFt(
                           wallet,
                           walletClass,
                           getTransactionClass(),
                           cardanoParams,
                           [
                              {
                                 policy: policyNft.cborHex,
                                 policyId: nftPolicyId,
                                 assetName,
                                 qty: qtyNft,
                                 positive: false
                              },
                              {
                                 policy: policyFt.cborHex,
                                 policyId: ftPolicyId,
                                 assetName,
                                 qty: qtyFt,
                                 positive: false
                              }
                           ],
                           []
                        ).finally(resetRunningTx)
                     }}
                  >
                     {#if runningTx === 'burn'}
                        <div class="flex flex-nowrap justify-center items-center gap-3">
                           <div class="-m-2"><ScaleOut size="32" color="blue" /></div>
                           Burning currency...
                        </div>
                     {:else}
                        BURN CURRENCY
                     {/if}
                  </button>
               </div>
            </InlineDropdown>
         </div>
      {:else if qtyNft}
         <div class="flex flex-col gap-4 items-center">
            <div style="max-width: 16rem" class="mx-28">
               <AssetPreview
                  tokenType="nft"
                  policyId={nftPolicyId}
                  assetName={assetNameHex}
                  qty={qtyNft}
               />
            </div>
            <div class="w-full flex flex-col gap-2">
               <InlineDropdown>
                  <div
                     let:isExpanded
                     slot="button"
                     class="grow text-xl xs:text-2xl text-slate-600 text-left flex flex-nowrap gap-4"
                  >
                     Burn token
                     <div class:rotate-90={isExpanded}>❯</div>
                  </div>
                  <div class="flex flex-col gap-4 nm-inset-slate-100 p-4 rounded-3xl">
                     <span class="max-w-fit bg-orange-300 p-2 rounded-2xl">
                        This will destroy your token. If this is a Control NFT for a currency - you
                        will lock the supply of this currency.
                     </span>
                     <button
                        class="px-4 py-2 rounded-2xl nm-flat-slate-100 w-full"
                        disabled={txRunning}
                        on:click={() => {
                           runningTx = 'burn'
                           txPromise = burnFt(
                              wallet,
                              walletClass,
                              getTransactionClass(),
                              cardanoParams,
                              [
                                 {
                                    policy: policyNft.cborHex,
                                    policyId: nftPolicyId,
                                    assetName,
                                    qty: qtyNft,
                                    positive: false
                                 }
                              ],
                              []
                           ).finally(resetRunningTx)
                        }}
                     >
                        {#if runningTx === 'burn'}
                           <div class="flex flex-nowrap justify-center items-center gap-3">
                              <div class="-m-2"><ScaleOut size="32" color="blue" /></div>
                              Burning nft...
                           </div>
                        {:else}
                           BURN NFT
                        {/if}
                     </button>
                  </div>
               </InlineDropdown>
            </div>
         </div>
      {:else}
         <div class="pt-28">
            <span class="text-xl xs:text-3xl text-slate-500">token not found in wallet</span>
         </div>
      {/if}
      <PromiseResult bind:txPromise bind:txRunning let:result let:error let:resetTxPromise>
         <span
            slot="success"
            class="mt-2 pl-4 rounded-2xl bg-green-300 flex flex-row gap-4 justify-between place-items-center"
         >
            <a target="_blank" href="https://cardanoscan.io/transaction/{result}">
               Success! Open on Cardanoscan
            </a>
            <button class="p-2 m-0" on:click={resetTxPromise}>
               <Awesome data={timesCircle} scale={1.5} />
            </button>
         </span>
         <span
            slot="error"
            class="mt-2 pl-4 rounded-2xl bg-orange-300 flex flex-row gap-4 justify-between place-items-center"
         >
            Error occured: {error}
            <button class="p-2 m-0" on:click={resetTxPromise}>
               <Awesome data={timesCircle} scale={1.5} />
            </button>
         </span>
      </PromiseResult>
   {/await}
{:else}
   <div class="pt-28">
      <a class="text-slate-500 text-xl xs:text-3xl" href="#connect">connect your wallet to start</a>
   </div>
{/if}
