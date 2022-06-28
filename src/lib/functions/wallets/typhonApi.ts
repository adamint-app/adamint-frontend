import { adaAssetName, adaPolicyId } from '$lib/functions/cardanoConstants'
import type { TransactionWallet } from '$lib/types/cardano/transactionWallet'
import type { APIResponse, Balance, WalletTyphonApi } from '$lib/types/wallets/typhonApi'
import type { WalletLike, CardanoValue } from '$lib/types/walletLike'

// export async function enableWalletTyphon(wallet: WalletTyphonApi): Promise<WalletTyphonApi> {
//    return wallet.enable()
//       .then(() => wallet)
// }

const successOrError = <T, E>(response: APIResponse<T, E>) => response.status
  ? Promise.resolve(response.data)
  : Promise.reject(response)

// function assetsToStrings(value: WasmAssets[]): [string, [string, string][]][] {
//    return value.map(([policy, assets]) => [
//       getPolicyId(policy),
//       assets.map(([assetName, qty]) => [getAssetName(assetName), qty.to_str()])
//    ])
// }

const balanceToString = (balance: Balance) => {
   const result = new Map<string, Map<string, string>>()
   result.set(adaPolicyId, new Map<string, string>().set(adaAssetName, balance.ada))
   return balance.tokens.reduce((acc, cur) => {
      let assets = acc.get(cur.policyId)
      if (!assets) {
         assets = new Map<string, string>()
         acc.set(cur.policyId, assets)
      }
      assets.set(cur.assetName, cur.amount.toFixed(0))
      return acc
   }, result)
}

export const walletLikeTyphon: WalletLike<WalletTyphonApi> = {
   enableWallet: (wallet) => wallet.enable().then(() => wallet),
   getBalance: (wallet) => wallet.getBalance()
      .then(successOrError)
      .then(balanceToString),
   getUtxos: () => Promise.reject('Typhoon wallet API not supported yet!'),
   getAddresses: () => Promise.reject('Typhoon wallet API not supported yet!'),
   getIcon: (wallet) => wallet.icon,
   getName: (wallet) => wallet.name,
   getApiVersion: () => { throw new Error('Typhoon wallet API not supported yet!') },
   sendTx: () => Promise.reject('Typhoon wallet API not supported yet!')
}

export const transactionWalletTyphon: TransactionWallet<WalletTyphonApi> = {
   mintFtTransaction: () =>
      Promise.reject('Typhoon wallet API not supported yet!'),
   mintNftTransaction: () =>
      Promise.reject('Typhoon wallet API not supported yet!')
}