import type { TokenParam, FtParams, TokenDeltaParam } from "./transactionModel"
import type { CardanoParams } from "$lib/functions/cardanoConstants"
import type { CardanoMetadata } from "./metadata"

export type MkMetadata = (assetName: Uint8Array) => CardanoMetadata

export type TransactionWallet<Wallet> = {
   mintFtTransaction(wallet: Wallet, mintParams: FtParams, cardanoParams: CardanoParams, mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
   mintNftTransaction(wallet: Wallet, cardanoParams: CardanoParams, mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
   burnFtTransaction(wallet: Wallet, cardanoParams: CardanoParams, toBurn: TokenDeltaParam[], continuing: TokenParam[], mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
}