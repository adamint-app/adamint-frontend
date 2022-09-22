<script lang="ts">
   import { useWalletConnector } from '$lib/compositions/walletConnector'
   import { mapDiff, mapPartition } from '$lib/functions/map'
   import { ftPolicyId, nftPolicyId } from '$lib/functions/policyIds'
   import { tuple, tuples } from '$lib/functions/tuple'
   import type { AnyWalletLike } from '$lib/functions/walletUtils'
   import type { CardanoValue, WalletLike } from '$lib/types/walletLike'
   import AssetPreview from '$lib/components/cardano/assetPreview.svelte'
   import { zip } from '$lib/functions/tuple'

   const { subscribe, getWallet, getWalletClass } = useWalletConnector()
   let wallet = getWallet()
   let walletClass = getWalletClass()
   subscribe((w) => {
      wallet = w?.[0]
      walletClass = w?.[1]
   })
   function groupAssets(value: CardanoValue) {
      const ftMap = value.get(ftPolicyId) ?? new Map<string, string>()
      const nftMap = value.get(nftPolicyId) ?? new Map<string, string>()
      const [controllableFt, uncontrollableFt] = mapPartition(ftMap, nftMap)
      const lonelyNft = mapDiff(nftMap, ftMap)
      const zipPolicy =
         (policy: string) =>
         ([asset, qty]: [string, string]) =>
            tuple(policy, asset, qty)
      return tuple(
         Array.from(controllableFt).map(zipPolicy(ftPolicyId)),
         Array.from(uncontrollableFt).map(zipPolicy(ftPolicyId)),
         Array.from(lonelyNft).map(zipPolicy(nftPolicyId))
      )
   }
</script>

<svelte:head>
   <title>AstroMint | Control</title>
</svelte:head>

{#if wallet}
   {#await walletClass.getBalance(wallet)}
      <div class="pt-28">
         <span class="text-xl xs:text-3xl text-slate-500">Loading wallet balance...</span>
      </div>
   {:then balance}
      <!-- {@const [controllableFt, uncontrollableFt, lonelyNft] = groupAssets(balance)} -->
      {@const assets = zip(
         groupAssets(balance),
         tuples([
            ['ft', true, 'Currencies you control:', 'grid-cols-1 lg:grid-cols-2'],
            ['ft', false, 'Legitimate currencies you have:', 'grid-cols-1 lg:grid-cols-2'],
            [
               'nft',
               true,
               'Legitimate NFTs you have:',
               'grid-flow-col grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            ]
         ])
      )}
      <div class="w-5/7">
         {#each assets as [asset, [tokenType, controllable, desc, _class]]}
            {#if asset.length > 0}
               <span class="text-xl xs:text-2xl text-slate-500">{desc}</span>
               <div class="grow grid ${_class} gap-4 py-5">
                  {#each asset as [policyId, assetName, qty]}
                     <AssetPreview {tokenType} {policyId} {assetName} {qty}>
                        {#if controllable}
                           <a
                              class="px-2 py-1 rounded-2xl border-2 border-slate-200 text-slate-700
                              bg-slate-100 bg-opacity-80"
                              href={`control/${assetName}`}
                           >
                              control
                           </a>
                        {/if}
                     </AssetPreview>
                  {/each}
               </div>
            {/if}
         {/each}
      </div>
      {#if assets.reduce((acc, [cur]) => acc + cur.length, 0) === 0}
         <div class="pt-28">
            <span class="text-slate-500 text-base xs:text-xl"
               >you do not have any tokens minted with AstroMint in your wallet</span
            >
         </div>
      {/if}
   {/await}
{:else}
   <div class="pt-28">
      <a class="text-slate-500 text-xl xs:text-3xl" href="#connect">connect your wallet to start</a>
   </div>
{/if}

<style lang="scss">
   //@use "../markdown.css"
</style>
