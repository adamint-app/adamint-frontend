import { mkFunctionString } from '$lib/functions/string'
import { assetsCardanoValue, fromWasmUTxOId, valueWasmAssets } from '$lib/functions/wasmUtils'
import type { Address, AssetName, Assets, AuxiliaryData, AuxiliaryDataHash, BaseAddress, BigNum, Bip32PrivateKey, Bip32PublicKey, Ed25519KeyHash, Ed25519Signature, EnterpriseAddress, GeneralTransactionMetadata, hash_auxiliary_data, hash_transaction, Int, LinearFee, make_vkey_witness, MetadataList, MetadataMap, Mint, MintAssets, min_ada_required, min_fee, MultiAsset, NativeScript, NativeScripts, NetworkInfo, PrivateKey, PublicKey, ScriptAll, ScriptAny, ScriptHash, ScriptHashNamespace, ScriptNOfK, ScriptPubkey, StakeCredential, TimelockExpiry, TimelockStart, Transaction, TransactionBody, TransactionBuilder, TransactionHash, TransactionInput, TransactionInputs, TransactionMetadatum, TransactionOutput, TransactionOutputs, TransactionWitnessSet, Value, Vkeywitnesses, TransactionUnspentOutput, TransactionUnspentOutputs } from '$lib/../../node_modules/cardano-serialization-lib'
import type { WalletLike, WalletUTxO } from '$lib/types/walletLike'
import { Buffer } from 'buffer'
import { makeTxBuilderCfg, sendTransaction, buildUnknownMintTransaction, wasmQtyFromSupply, toBigNum, preEvaluateTx, signTx, type TxUnknowns, type MintTransactionBuilder, type WasmTokenDeltaParam, wasmTokenDeltaParam, wasmTokenParam, type WasmTokenParam, rejectWith, runIgnoreErrors } from '$lib/functions/wasmTransactionUtils'
import type { CardanoWasm } from "$lib/types/cardano/wasm"
import type { MkMetadata, TransactionWallet } from '$lib/types/cardano/transactionWallet'
import { mapUncbor, uncbor, unsafeCborHex, type WalletCIP30Api } from '$lib/types/wallets/cip30Api'
import policyFt from '$lib/../../static/cardano/mint-ft-policy.json'
import policyNft from '$lib/../../static/cardano/mint-nft-policy.json'
import { ftPolicyId, nftPolicyId } from '$lib/functions/policyIds'
import { tuple } from '../tuple'
import type { CardanoMetadata } from '$lib/types/cardano/metadata'
import type { CardanoParams } from '../cardanoConstants'

// export async function enalbeWalletCIP30(wallet: WalletCIP30Api): Promise<WalletCIP30Api> {
//    const instance = await wallet.enable()
//    const apiVersion = mkFunctionString(wallet.apiVersion)
//    return {...wallet, instance, apiVersion}
// }



// function fromWasmUTxOs(wasm: CardanoWasm, utxos: TransactionUnspentOutputs) {
//    utxos.len
// }

function fromWasmUTxO(utxo: TransactionUnspentOutput) {
   return {
      ...fromWasmUTxOId(utxo),
      value: assetsCardanoValue(valueWasmAssets(utxo.output().amount()))
   } as WalletUTxO
}

export const walletLikeCIP30: WalletLike<WalletCIP30Api> = {
   enableWallet: async (wallet) => {
         wallet.instance = await wallet.enable()
         wallet.apiVersion = mkFunctionString(wallet.apiVersion)
         if (!wallet.instance.getCollateral) {
            wallet.instance.getCollateral = (wallet.instance as any).experimental?.getCollateral
         }
         return wallet
   },
   getBalance: (wallet) => wallet.instance.getBalance()
      .then(data => Buffer.from(data as any, 'hex'))
      //.then(data => Buffer.from(data))
      .then(cardanoWasm.Value.from_bytes)
      .then(value => assetsCardanoValue(valueWasmAssets(value))),
   getUtxos: (wallet) => wallet.instance.getUtxos()
      // .then(bytes => 
      .then(mapUncbor(cardanoWasm.TransactionUnspentOutput.from_bytes))
      .then(utxos => utxos.map(fromWasmUTxO)),
   getAddresses: (wallet) => wallet.instance.getUsedAddresses()
      .then(mapUncbor(cardanoWasm.Address.from_bytes))
      .then(as => as.map(a => a.to_bech32())),
   getIcon: (wallet) => wallet.icon,
   getName: (wallet) => wallet.name,
   getApiVersion: (wallet) => wallet.apiVersion(),
   sendTx: sendTransaction
}

const mkRunner = (mkMetadata: Promise<MkMetadata>,
   runTx: (unknowns?: TxUnknowns) => Promise<MintTransactionBuilder>) => async (unknowns?: TxUnknowns) => {
   const {assetName, txBuilder} = await runTx(unknowns)
   return txBuilder((await mkMetadata)(assetName))
}

const evaluateFeeAndSign = async (cardanoParams: CardanoParams, wallet: WalletCIP30Api, toMint: WasmTokenDeltaParam[], continuing: WasmTokenParam[], mkMetadata: Promise<MkMetadata>) => {
   const config = makeTxBuilderCfg(cardanoParams)
   const runTx = (unknowns?: TxUnknowns) =>
      buildUnknownMintTransaction(wallet, config, cardanoParams, toMint, [], unknowns)
   const runner = mkRunner(mkMetadata, runIgnoreErrors(runTx))
   const dummy = await signTx(wallet, await runner())
   const cost = await preEvaluateTx(dummy)
   const tx = await signTx(wallet, await runner(cost))
   return tx.to_bytes()
}

export const transactionWalletCIP30: TransactionWallet<WalletCIP30Api> = {
   mintFtTransaction: async (wallet, ftParams, cardanoParams, mkMetadata) => {
      const [scriptFt, scriptNft] = mapUncbor(cardanoWasm.PlutusScript.from_bytes)([policyFt.cborHex, policyNft.cborHex].map(unsafeCborHex))
      const [scriptHashFt, scriptHashNft] = mapUncbor(cardanoWasm.ScriptHash.from_bytes)([ftPolicyId, nftPolicyId].map(unsafeCborHex))
      const toMint = [
         tuple(scriptFt, scriptHashFt, undefined, wasmQtyFromSupply(ftParams.supply, ftParams.decimals), true),
         ...ftParams.mintControlUTxO
            ? [tuple(scriptNft, scriptHashNft, undefined, toBigNum(1), true)]
            : []
      ]

      return evaluateFeeAndSign(cardanoParams, wallet, toMint, [], mkMetadata)
   },
   mintNftTransaction: async (wallet, cardanoParams, mkMetadata) => {
      const scriptNft = uncbor(cardanoWasm.PlutusScript.from_bytes)(unsafeCborHex(policyNft.cborHex))
      const scriptHashNft = uncbor(cardanoWasm.ScriptHash.from_bytes)(unsafeCborHex(nftPolicyId))
      const toMint = [
         tuple(scriptNft, scriptHashNft, undefined, toBigNum(1), true)
      ]

      return evaluateFeeAndSign(cardanoParams, wallet, toMint, [], mkMetadata)
   },
   burnFtTransaction: (wallet, cardanoParams, toBurn, continuing, mkMetadata) => {
      return evaluateFeeAndSign(cardanoParams, wallet, toBurn.map(wasmTokenDeltaParam), continuing.map(wasmTokenParam), mkMetadata)
   }
}
