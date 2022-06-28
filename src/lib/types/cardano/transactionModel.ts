export type FtParams = {
   decimals: number
   supply: number
   mintControlUTxO: boolean
}

export type TokenParam = {
   policy: string
   policyId: string
   assetName: Uint8Array
   qty: string
}

export type TokenDeltaParam = TokenParam & {
   positive: boolean
}