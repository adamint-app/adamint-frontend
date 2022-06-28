type CardanoAuth = {
   checkHexPayload(payload_hex_string, signature_hex_string): unknown
   getWalletId(): unknown
   getWalletPubKey(): unknown
   isEnabled(): boolean
   signHexPayload(payload_hex_string)
}

type TempAuth = {
   _auth: unknown
   _cardano_rpc_call(func, params): unknown
}

export interface YoroiWebWalletApi {
   experimantal: {
      auth(): TempAuth //CardanoAuth
      createTx(req: unknown): unknown
      onDisconnect(callback: () => void)
      setReturnType(returnType: string): unknown
   }
   _auth: TempAuth //CardanoAuth
   _cardano_rpc_call(func, params): unknown
   _disconnection: boolean[]
   _returnType: string[]
}
