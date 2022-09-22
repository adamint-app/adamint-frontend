import type { TokenParam, FtParams, TokenDeltaParam } from "./transactionModel"
import type { CardanoMetadata } from "./metadata"

export type MkMetadata = (assetName: Uint8Array) => CardanoMetadata

export type TransactionWallet<Wallet> = {
   mintFtTransaction(wallet: Wallet, mintParams: FtParams, mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
   mintNftTransaction(wallet: Wallet, mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
   burnFtTransaction(wallet: Wallet, toBurn: TokenDeltaParam[], continuing: TokenParam[], mkMetadata: Promise<MkMetadata>): Promise<Uint8Array>
}