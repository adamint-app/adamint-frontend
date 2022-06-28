export type CardanoValue = Map<string, Map<string, string>> //[string, [string, string][]][]

export type WalletUTxO = {
   address: string // bech32
   index: number
   value: CardanoValue
   // plutusDataCbor?: string // cbor hex string
   // plutusDataHash?: string // hex string
}

export type ScriptUTxO = WalletUTxO & {
   plutusDatumHash: string
}

export type WalletLike<Wallet> = {
   getIcon(wallet: Wallet): string
   getName(wallet: Wallet): string
   getApiVersion(wallet: Wallet): string
   getAddresses(wallet: Wallet): Promise<string[]>
   enableWallet(wallet: Wallet): Promise<Wallet>
   getBalance(wallet: Wallet): Promise<CardanoValue>
   getUtxos(wallet: Wallet): Promise<WalletUTxO[]>
   sendTx(wallet: Wallet, tx: Uint8Array): Promise<string>
}