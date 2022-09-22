import type { FtParams } from "$lib/types/cardano/transactionModel"
import type { MintTransactionBuilder, TransactionWallet } from "$lib/types/cardano/transactionWallet"
import { assetIconAllowed, assetIconBlobAllowed } from "$lib/functions/assetIcon"
import type { AnyWallet, AnyWalletLike } from "$lib/functions/walletUtils"
import type { ImportCandidate } from 'ipfs-core-types/types/src/utils'
import { CID } from 'multiformats/cid'
import { cip25label, cip38label, initCIP25, initCIP38, mergeMetadata } from "$lib/functions/metadataUtils"
import { ftPolicyId, nftPolicyId } from "$lib/functions/policyIds"
import { objectFirst, prefixKeys } from "$lib/functions/object"
import { convertBase64ToBlob, toHex } from "$lib/functions/bytes"
import type { MetadataCIP25 } from "$lib/types/cardano/metadata/cip25"
import type { MetadataCIP38 } from "$lib/types/cardano/metadata/cip38"
import type { WalletLike } from "$lib/types/walletLike"
import { nftStorageClient } from "$lib/services/nftStorageClient"
import { base32 } from 'multiformats/bases/base32'
import { base58btc } from 'multiformats/bases/base58'
import { Buffer } from 'buffer'
import { zip } from "$lib/functions/tuple"
import type { CardanoMetadata } from "$lib/types/cardano/metadata"
import { rejectWith, type TxUnknowns } from "../wasmTransactionUtils"

// https://github.com/savaki/CIPs/blob/master/CIP-0035/CIP-0035.md
export type UiFtParams = {
   type: 'ft'
   name: string
   ticker: string
   url: string
   desc: string
   icon: string | null
   icons: Record<string, Blob>
   decimals: number
   supply: number
   mintControlUTxO: boolean
}

// It is not clear how good is support for CIP-38(old CIP-35) vs CIP-25
// So main metadata is to be contained in CIP-38 property (20),
// while some info is duplicated in CIP-25 property (721)

// async function asyncUpload(toUpload: [string, string | ArrayBuffer][]) {
//    const uploadedIds = [] as string[]
//    try{
//    console.log('uploading:')
//    console.log(toUpload)
//    for await (const result of ipfsClient.addAll(toUpload.map(e => e[1]))) {
//       uploadedIds.push(result.path)
//       console.log('uploaded image:')
//       console.log(result)
//    }
//    }catch(e){console.log(e)}
// 
//    if (toUpload.length !== uploadedIds.length) {
//       throw new Error('Not all files uploaded!')
//    }
// 
//    return zip(toUpload.map(e => e[0]), uploadedIds)
// }

// https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
// function stringToBuffer(data: string | ArrayBuffer) {
//    return typeof data === 'string'
//       ? convertBase64ToBlob(data)
//       : data
// }

async function asyncUploadNft(toUpload: [string, Blob][]) {
   const uploadedIds = [] as string[]
   try{
   // https://stackoverflow.com/questions/59694309/for-await-of-vs-promise-all
   for (const result of await Promise.all(toUpload.map(e => nftStorageClient.storeBlob(e[1])))) {
      // uploadedIds.push('ipfs://' + result)
      console.log('asyncUploadNft', result, CID.parse(result), CID.parse(result).code)
      //uploadedIds.push('ipfs://' + CID.parse(result, base32).toV0().toString())
      // By default, CIDs from nft.starage are in V1 base32 format,
      // which is too long to store in cardano metadata.
      // It needs to be converted into shorter, base58 representation
      uploadedIds.push('ipfs://' + CID.parse(result).toString(base58btc))
   }
   }catch(e){
      console.log(e)
      throw e
   }

   if (toUpload.length !== uploadedIds.length) {
      throw new Error('Not all files uploaded!')
   }

   return zip(toUpload.map(e => e[0]), uploadedIds)
}

export async function mintFt(
   wallet: AnyWalletLike,
   walletClass: WalletLike<AnyWalletLike>,
   transactionClass: TransactionWallet<AnyWalletLike>,
   uiMintParams: UiFtParams) {

   {
      const firstInvalid = objectFirst(uiMintParams.icons, v => !assetIconBlobAllowed(v))
      if (firstInvalid) {
         throw new Error(`Icon '${firstInvalid[0]}' is not allowed due to size or format`)
      }
   }

   if (!uiMintParams.icons[uiMintParams.icon]) {
      throw new Error('Default icon not set or not present in icon list!')
   }

   // =====
   const rawIcons = Object.entries(uiMintParams.icons)

   // Uploading icons and preparing transaction in parallel - with Promise.all

   const mkMetadata = asyncUploadNft(rawIcons).then(uploadedIcons =>
      (assetName: Uint8Array) => {
      const icons = Object.fromEntries(uploadedIcons)
      const prefix = 'icon-'
      const iconPrefixedInfo = zip(rawIcons, uploadedIcons)
         .filter(i => i[0][0] !== uiMintParams.icon) // Exclude thumbnail image from file list
         .map(([r, u]) => ({
            name: prefix + r[0],
            mediaType: r[1].type,
            src: u[1]
         }))

      // =====
      const assetNameHex = '0x' + toHex(assetName)

      const cip25Ft = initCIP25(ftPolicyId, assetNameHex)({
         name: uiMintParams.name,
         image: icons[uiMintParams.icon],
         mediaType: uiMintParams.icons[uiMintParams.icon].type,
         description: uiMintParams.desc,
         symbol: uiMintParams.ticker,
         decimals: uiMintParams.decimals,
         files: iconPrefixedInfo
      }, '1.1')

      const cip38Ft = initCIP38(ftPolicyId, assetNameHex)({
         ticker: uiMintParams.ticker,
         url: uiMintParams.url,
         desc: uiMintParams.desc,
         icon: icons[uiMintParams.icon],
         decimals: uiMintParams.decimals,
         version: '1.0',
         ...prefixKeys<typeof prefix>(prefix)(icons)
      })

      const cip25Nft = initCIP25(nftPolicyId, assetNameHex)({
         name: wrapStringMax(uiMintParams.name, 64, [
            ['Control Token | ', ''],
            ['Control | ', ''],
         ]),
         image: icons[uiMintParams.icon],
         mediaType: uiMintParams.icons[uiMintParams.icon].type,
         description: wrapStringMax(uiMintParams.name, 64, [
            ['Control token for <', '> currency'],
            ['Control for <', '> currency'],
            ['Control for <', '>'],
         ])
      }, '1.1')
      return mergeMetadata([cip25Ft, cip38Ft, cip25Nft])
   })

   const tx = await transactionClass.mintFtTransaction(wallet, uiMintParams, mkMetadata)
   return walletClass.sendTx(wallet, tx).catch(e => {
      console.log(e)
      return rejectWith(e)
   })
}

function wrapStringMax(src: string, maxLen: number, wraps: [string, string][]) {
   if (src.length > maxLen) {
      return src
   }
   for (const wrap of wraps) {
      if (wrap[0].length + src.length + wrap[1].length <= maxLen) {
         return wrap[0] + src + wrap[1]
      }
   }
   return src
}