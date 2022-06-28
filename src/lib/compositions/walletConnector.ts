import { writable, get } from "svelte/store"
import type { AnyWalletLike } from "$lib/functions/walletUtils"
import type { CardanoWasm } from "$lib/types/cardano/wasm"
import type { WalletLike } from "$lib/types/walletLike"
import type { TransactionWallet } from "$lib/types/cardano/transactionWallet"

// https://cardano.stackexchange.com/questions/6015/how-can-i-use-cardano-serialization-lib-in-the-browser-to-decode-cbor

const state = writable<[AnyWalletLike, WalletLike<AnyWalletLike>, TransactionWallet<AnyWalletLike>]>(undefined)

function setConnector(connector: [ AnyWalletLike,
                                   WalletLike<AnyWalletLike>,
                                   TransactionWallet<AnyWalletLike> ]) {
   state.set(connector)
}

export function useWalletConnector() {
   return {
      subscribe: state.subscribe,
      getWallet: () => get(state)?.[0],
      getWalletClass: () => get(state)?.[1],
      getTransactionClass: () => get(state)?.[2],
      setConnector,
      resetConnector: () => setConnector([undefined, undefined, undefined])
   }
}
