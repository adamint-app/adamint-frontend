import type { TokenDeltaParam, TokenParam } from "$lib/types/cardano/transactionModel"
import type { TransactionWallet } from "$lib/types/cardano/transactionWallet"
import { assetIconAllowed, assetIconBlobAllowed } from "$lib/functions/assetIcon"
import type { CardanoParams } from "$lib/functions/cardanoConstants"
import type { AnyWalletLike } from "$lib/functions/walletUtils"
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
import { rejectWith } from "../wasmTransactionUtils"

export async function burnFt(
   wallet: AnyWalletLike,
   walletClass: WalletLike<AnyWalletLike>,
   transactionClass: TransactionWallet<AnyWalletLike>,
   cardanoParams: CardanoParams,
   toMint: TokenDeltaParam[],
   continuing: TokenParam[]) {
   const tx = await transactionClass.burnFtTransaction(wallet, cardanoParams, toMint, continuing, Promise.resolve(() => undefined))
   return walletClass.sendTx(wallet, tx).catch(e => {
      console.log(e)
      return rejectWith(e)
   })
}