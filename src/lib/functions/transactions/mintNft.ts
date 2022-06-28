import type { FtParams } from "$lib/types/cardano/transactionModel"
import type { TransactionWallet } from "$lib/types/cardano/transactionWallet"
import { assetIconAllowed, assetIconBlobAllowed } from "$lib/functions/assetIcon"
import type { CardanoParams } from "$lib/functions/cardanoConstants"
import type { AnyWalletLike } from "$lib/functions/walletUtils"
import type { ImportCandidate } from 'ipfs-core-types/types/src/utils'
import { CID } from 'multiformats/cid'
import { cip25label, cip38label, initCIP25, initCIP38, mergeMetadata } from "$lib/functions/metadataUtils"
import { ftPolicyId, nftPolicyId } from "$lib/functions/policyIds"
import { objectFirst, prefixKeys } from "$lib/functions/object"
import { convertBase64ToBlob, toHex, toUtf8 } from "$lib/functions/bytes"
import type { MetadataCIP25 } from "$lib/types/cardano/metadata/cip25"
import type { MetadataCIP38 } from "$lib/types/cardano/metadata/cip38"
import type { WalletLike } from "$lib/types/walletLike"
import { nftStorageClient } from "$lib/services/nftStorageClient"
import { base32 } from 'multiformats/bases/base32'
import { base58btc } from 'multiformats/bases/base58'
import { Buffer } from 'buffer'
import { zip } from "$lib/functions/tuple"
import { rejectWith } from "../wasmTransactionUtils"
// import { cip30runner, submitDummy } from "../wasmTransactionUtils"

// https://cips.cardano.org/cips/cip25/
export type UiNftParams = {
   type: 'nft'
   name: string
   image: Blob
   mediaType: string
   description: string
   files: {
      name: string
      mediaType: string
      src: string | Blob
   }[]
   version: '1.0'
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
//       return Promise.reject('Not all files uploaded!')
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
      // By default, CIDs from nft.starage are in V1 base32 format,
      // which is too long to store in cardano metadata.
      // It needs to be converted into shorter, base58 representation
      uploadedIds.push('ipfs://' + CID.parse(result).toString(base58btc))
   }
   }catch(e){
      console.log(e)
      return Promise.reject(e)
   }

   if (toUpload.length !== uploadedIds.length) {
      return Promise.reject('Not all files uploaded!')
   }

   return zip(toUpload.map(e => e[0]), uploadedIds)
}

export async function mintNft(
   wallet: AnyWalletLike,
   walletClass: WalletLike<AnyWalletLike>,
   transactionClass: TransactionWallet<AnyWalletLike>,
   uiMintParams: UiNftParams,
   cardanoParams: CardanoParams) {

   {
      if (!uiMintParams.image) {
         return Promise.reject(`NFT should have an image!`)
      }
   }

   if (!uiMintParams.name || uiMintParams.name.trim().length === 0) {
      return Promise.reject('NFT should have a name!')
   }

   // =====
   const toUploadImage = [['', uiMintParams.image] as [string, Blob]]
   const toUploadFiles = uiMintParams.files?.map((f, i) => [i.toString(), f.src] as [string, Blob])

   // Uploading icons and preparing transaction in parallel - with Promise.all
   const uploadPromise = Promise.all([
      asyncUploadNft(toUploadImage),
      uiMintParams.files
         ? asyncUploadNft(toUploadFiles)
         : Promise.resolve(undefined as [string, string][])
   ])

   const mkMetadata = uploadPromise.then(([[uploadedImage], uploadedFiles]) => (assetName: Uint8Array) => {
      const files = uiMintParams.files
         ? zip(uiMintParams.files, uploadedFiles).map(([a, b]) => ({...a, src: b[1]}))
         : undefined

      const assetNameHex = '0x' + toHex(assetName)

      const cip25Nft = initCIP25(nftPolicyId, assetNameHex)({
         name: uiMintParams.name,
         image: uploadedImage[1],
         mediaType: uiMintParams.mediaType
            ? uiMintParams.mediaType
            : uiMintParams.image.type,
         description: uiMintParams.description,
         files
      }, '1.1')

      // ====
      console.log('Trying to submit metadata:')
      console.log(cip25Nft)
      return cip25Nft
   })

   const tx = await transactionClass.mintNftTransaction(wallet, cardanoParams, mkMetadata)
   return walletClass.sendTx(wallet, tx).catch(e => {
      console.log(e)
      return rejectWith(e)
   })
}
