<script lang="ts" context="module">
   import type {
      CardanoMetadata,
      TokenMetadataBody,
      TokenMetadataPayload
   } from '$lib/types/cardano/metadata'
   import type { MetadataCIP25 } from '$lib/types/cardano/metadata/cip25'
   import type { MetadataCIP38 } from '$lib/types/cardano/metadata/cip38'
   import { cip25label, cip38label, mergeMetadata } from '$lib/functions/metadataUtils'
   import { useMediaQuery } from '$lib/compositions/mediaQuery'
   const imageUriToSrc = (image: string) => {
      if (image) {
         if (image.slice(0, 7) === 'ipfs://') {
            return 'https://ipfs.io/ipfs/' + image.slice(7)
         }
         if (image.slice(0, 8) === 'https://') {
            return image
         }
      }
      return 'https://cryptologos.cc/logos/cardano-ada-logo.svg'
   }
   const gqlMetadataVars = (policyId: string, assetName: string, limit = 5, offset = 0) => ({
      limit,
      offset,
      where: {
         asset: {
            policyId: { _eq: policyId },
            assetName: { _eq: assetName }
         }
      }
   })

   type GQLTokenMetadata = {
      //data: {
      tokenMints: {
         transaction: {
            metadata: {
               key: string
               value: TokenMetadataBody<MetadataCIP25 | MetadataCIP38>
            }[]
         }
      }[]
      //}
   }
   const getAllMetadata = (meta: GQLTokenMetadata) =>
      mergeMetadata(
         meta.tokenMints
            .at(-1)
            .transaction.metadata.map((m) =>
               m.key === cip25label
                  ? { [m.key]: m.value }
                  : m.key === cip38label
                  ? { [m.key]: m.value }
                  : undefined
            )
            .filter((m) => m)
      ) as MetadataCIP25 & MetadataCIP38

   function getMetadata<T>(label: string, policyId: string, assetName: string) {
      return (meta: GQLTokenMetadata) => {
         if (!meta) return undefined
         const m = meta.tokenMints.at(-1).transaction.metadata.find((m) => m.key === label)
         return m?.value?.[policyId]?.['0x' + assetName] as TokenMetadataPayload<T>
      }
   }
   function getMetadataHttp<T>(policyId: string, assetName: string) {
      return fetch(`https://pool.pm/asset/${assetFingerprint(policyId, assetName)}`)
         .then((r) => r.json())
         .then((d) => d['metadata'] as TokenMetadataPayload<T>)
   }
   const screen_gt_xs = useMediaQuery('(max-width: 380px)')
</script>

<script lang="ts">
   import tokenMetadata from '$lib/services/cardanoGraphQL/tokenMetadata.gql?raw'
   import { gql } from '@apollo/client/core/index.js'
   // import { query, type ReadableQuery } from 'svelte-apollo'
   import { ScaleOut } from 'svelte-loading-spinners'
   import { tuple } from '$lib/functions/tuple'
   import BytesImage from '../bytesImage.svelte'
   import { image } from 'svelte-awesome/icons'
   import ShortAddress from './shortAddress.svelte'
   import { formatDecimals } from '$lib/functions/decimal'
   import { fromHex, hexToUtf8, toHex, toHex_ } from '$lib/functions/bytes'
   import { graphqlClient } from '$lib/services/cardanoGraphQL'
   import { assetFingerprint } from '$lib/functions/cardano/assetFingerprint'

   export let tokenType: 'ft' | 'nft'
   export let policyId: string
   export let assetName: string
   export let qty: string
   let _class = ''
   export { _class as class }

   // const meta = query<GQLTokenMetadata>(gql(tokenMetadata), {
   //    variables: gqlMetadataVars(policyId, assetName)
   // })
   const meta = graphqlClient.query<GQLTokenMetadata>(gql(tokenMetadata), {
      variables: gqlMetadataVars(policyId, assetName)
   })

   // $: metadataPromise = $meta.loading
   //    ? new Promise<GQLTokenMetadata>(() => {})
   //    : Promise.resolve($meta.data)
   export let cip25: TokenMetadataPayload<MetadataCIP25> = undefined
   export let cip38: TokenMetadataPayload<MetadataCIP38> = undefined

   getMetadataHttp(policyId, assetName)
      .catch(() => undefined)
      .then((data) => {
         cip25 = { ...data, ...cip25 }
         cip38 = { ...data, ...cip38 }
      })
   $: cip25 = getMetadata<MetadataCIP25>(cip25label, policyId, assetName)($meta.data)
   $: cip38 = getMetadata<MetadataCIP38>(cip38label, policyId, assetName)($meta.data)

   // const get25 = getMetadata<MetadataCIP25>(cip25label, policyId, assetName)
   // const get38 = getMetadata<MetadataCIP38>(cip38label, policyId, assetName)
</script>

<div class="nm-flat-slate-100 rounded-xl {_class}">
   {#if tokenType === 'ft'}
      <div class="pt-1 px-1 xs:px-2 flex flex-row gap-2">
         {#if cip38?.icon ?? cip25?.image}
            <img
               src={imageUriToSrc(cip38?.icon ?? cip25?.image)}
               class="w-12 h-12 xs:w-16 xs:h-16"
            />
         {:else}
            <span class="hidden sm:block"><ScaleOut size="64" color="blue" /></span>
            <span class="sm:hidden block"><ScaleOut size="48" color="blue" /></span>
         {/if}
         <div class="flex flex-col justify-evenly grow">
            <div class="flex flex-nowrap justify-between">
               <div class="flex flex-col">
                  <a
                     class="text-sm xs:text-base"
                     target="_blank"
                     href="https://pool.pm/{assetFingerprint(policyId, assetName)}"
                  >
                     {cip25?.name ?? ''}&nbsp;
                  </a>
                  <span class="text-sm pr-2">
                     {formatDecimals(
                        '.',
                        qty,
                        cip25?.decimals ?? cip38?.decimals
                     )}{#if cip25?.symbol ?? cip38?.ticker}
                        {` ${cip25?.symbol ?? cip38.ticker}`}
                     {/if}
                  </span>
               </div>
               <div class="pt-2"><slot /></div>
            </div>
            <div class="xs:flex xs:flex-nowrap gap-2 text-sm text-slate-500">
               <span class="flex flex-nowrap gap-1 text-xs text-slate-500">
                  <span class="hidden sm:block">policy ID:</span>
                  <span class="sm:hidden block">policy:</span>
                  <ShortAddress address={policyId} len={4} />
               </span>
               <p />
               <span class="flex flex-nowrap gap-1 text-xs text-slate-500">
                  <span class="hidden sm:block">asset name:</span>
                  <span class="sm:hidden block">asset:</span>
                  <ShortAddress address={assetName} len={4} />
               </span>
            </div>
         </div>
      </div>
      <div class="p-2 text-sm xs:text-base">{cip38?.desc ?? cip25?.description ?? ''}&nbsp;</div>
   {:else if tokenType === 'nft'}
      <div class="h-full flex flex-col justify-between relative">
         {#if $meta.loading}
            <img src="$lib/assets/no-image.jpg" class="rounded-t-xl aspect-square object-cover" />
            <div class="absolute top-0"><ScaleOut size="48" color="blue" /></div>
         {:else if cip25?.image}
            {#if typeof cip25.image === 'string'}
               <img
                  src={imageUriToSrc(cip25.image)}
                  class="rounded-t-xl aspect-square object-cover"
               />
            {:else}
               <BytesImage src={cip25.image} mediaType={cip25.mediaType} />
            {/if}
         {:else}
            <img src="$lib/assets/no-image.jpg" class="rounded-t-xl aspect-square object-cover" />
         {/if}
         <div class="absolute right-0 mx-2 my-3"><div><slot /></div></div>
         <div class="p-1">
            <a target="_blank" href="https://pool.pm/{assetFingerprint(policyId, assetName)}"
               >{cip25?.name ?? ''}&nbsp;</a
            >
            <div class="text-sm">{cip25?.description ?? ''}&nbsp;</div>
            <span class="flex flex-nowrap gap-2 text-xs text-slate-500">
               <span class="hidden sm:block">policy ID:</span>
               <span class="sm:hidden block">policy:</span>
               <ShortAddress address={policyId} len={4} />
            </span>
            <span class="flex flex-nowrap gap-2 text-xs text-slate-500">
               <span class="hidden sm:block">asset name:</span>
               <span class="sm:hidden block">asset:</span>
               <ShortAddress address={assetName} len={4} />
            </span>
         </div>
      </div>
   {/if}
</div>
