import type { WalletCIP30Api } from "$lib/types/wallets/cip30Api"
import type { WalletTyphonApi } from "$lib/types/wallets/typhonApi"
import { transactionWalletCIP30, walletLikeCIP30 } from "$lib/functions/wallets/cip30Api"
import { transactionWalletTyphon, walletLikeTyphon } from "$lib/functions/wallets/typhonApi"
//import type { CardanoWasm } from "$lib/types/cardano/wasm"
import { replaceAll } from "./string"
//import { Buffer } from 'buffer'
// import { valueWasmAssets } from "./wasmUtils"
import type { CardanoValue, WalletLike } from "$lib/types/walletLike"
import type { CardanoWasm } from "$lib/types/cardano/wasm"
import type { TransactionWallet } from "$lib/types/cardano/transactionWallet"
import type { ProtocolParams } from "$lib/types/cardano/network"

export function sanitizeWalletName(name: string) {
   return replaceAll(name, 'wallet', '', true).trim()
}

// export type WalletCandidates = Record<string, unknown>
export type WalletCandidate = { name: string }

export function fetchConnectors(w: Window): AnyWallet[] {
   let usedNames = new Set<string>()
   return w.cardano
      ? Object.entries(w.cardano)
           .filter(([,c]) => {
              return typeof c === 'object' && Object.keys(c).length !== 0
           })
           //.map((c) => (console.log(c), c))
           .filter(([,c]) =>
              usedNames.has(c.name) ? false : ((usedNames = usedNames.add(c.name)), true)
           )
           .map(extractWallet)
           .filter(w => w)
           .map((w) => ((w.icon = w.icon ?? knownConnectorIcons[w.name]), w))
      : []
}
const knownConnectorIcons = {
   yoroi: 'https://yoroi-wallet.com/assets/yoroi-logo-symbol.svg'
} as Record<string, string>

export type AnyWallet = WalletTyphonApi | WalletCIP30Api

 // AnyWalletLike is needed in case there is another instance needed to interact with wallet
 // e.g. AnyWalletLike = WalletTyphonApi | [WalletCIP30Api, CardanoWasm]
export type AnyWalletLike = AnyWallet

function extractWallet([key, candidate]: [string, WalletCandidate]): AnyWallet {
   switch(key) {
      // case 'typhon': {
      //    const wallet = {...candidate as WalletTyphonApi}
      //    wallet.walletType = 'typhon'
      //    return wallet
      // } 
      default:
         return !(candidate as WalletCIP30Api).apiVersion
            ? undefined
            : (() => {
               const wallet = {...candidate as WalletCIP30Api}
               wallet.walletType = 'cip30'
               return wallet
            })()
   }
}

export function showCardanoValue(value: CardanoValue) {
   const newline = '<br/>'
   const assetToString = ([name, qty]: [string, string]) =>
      `${name} : ${qty}`
   return Array.from(value.entries(),
      ([hash, assets]) =>
         (hash as unknown as string) + Array.from(assets, assetToString)
         .join(newline))
      .join(newline)
}

export function selectWalletTypeclass(wallet: AnyWallet): WalletLike<AnyWalletLike> {
   switch(wallet.walletType) {
      case 'cip30': return walletLikeCIP30
      case 'typhon': return walletLikeTyphon
   }
}

export function selectTransactionWalletTypeclass(wallet: AnyWallet): (cardanoParams: ProtocolParams) => TransactionWallet<AnyWalletLike> {
   switch(wallet.walletType) {
      case 'cip30': return transactionWalletCIP30
      case 'typhon': return ()=>transactionWalletTyphon
   }
}