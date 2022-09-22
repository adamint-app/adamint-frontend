import type { CardanoWasm } from "$lib/types/cardano/wasm"
import type { hash_script_data, BigNum, Value, TransactionBuilder, TransactionOutput, ScriptHash, Address, Costmdls, TransactionOutputs, AssetName, AuxiliaryData, Transaction, PlutusData } from '$lib/../../node_modules/cardano-serialization-lib'
import type {  TransactionUnspentOutput, TransactionBuilderConfig, PlutusScript } from '$lib/../../node_modules/cardano-serialization-lib'

import policyFt from '../../../static/cardano/mint-ft-policy.json'
import policyNft from '../../../static/cardano/mint-nft-policy.json'
import { ftPolicyId, nftPolicyId } from '$lib/functions/policyIds'
import { showCardanoValue, type AnyWallet } from "./walletUtils"
import { mapUncbor, tocbor, uncbor, unsafeCbor, unsafeCborBytes, unsafeCborHex, type WalletCIP30Api } from "$lib/types/wallets/cip30Api"
import { assetsCardanoValue, fakeHash, fromWasmUTxOId, utxoIdToRawBytes, valueWasmAssets, valueWasmAssetsOnly, type WasmAssets } from "$lib/functions/wasmUtils"
import { fromHex, fromHex_, toHex } from "$lib/functions/bytes"
import type { TokenParam, FtParams, TokenDeltaParam } from "$lib/types/cardano/transactionModel"
import type { CardanoMetadata } from "$lib/types/cardano/metadata"
import { Buffer } from 'buffer'
import { bech32m } from 'bech32'
import CoinSelection from "./cardano/CoinSelection"
import { tuple, zip } from "./tuple"
import type { WalletLike } from "$lib/types/walletLike"
import { makeOgmiosContext } from "$lib/services/ogmiosClient"
import type { ExUnits } from "@cardano-ogmios/schema"
import { compareNumber } from "./array"

import { createTxSubmissionClient } from "@cardano-ogmios/client"
import type { ProtocolParams } from "$lib/types/cardano/network"

enum MetadataJsonSchema {
   NoConversions,
   BasicConversions,
   DetailedSchema,
}

const getLinearFee = (cardanoParams: ProtocolParams) => cardanoWasm.LinearFee.new(
   toBigNum(cardanoParams.minFeeA),
   toBigNum(cardanoParams.minFeeB)
)

export function makeTxBuilderCfg (cardanoParams: ProtocolParams) {
   return cardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(getLinearFee(cardanoParams))
      .pool_deposit(toBigNum(cardanoParams.poolDeposit))
      .key_deposit(toBigNum(cardanoParams.keyDeposit))
      .max_value_size(parseInt(cardanoParams.maxValSize))
      .max_tx_size(cardanoParams.maxTxSize)
      .coins_per_utxo_word(toBigNum(cardanoParams.coinsPerUtxoWord))
      .price_mem(cardanoParams.priceMem)
      .price_step(cardanoParams.priceStep)
      .costmdls(makeCostModel(cardanoParams))
      .prefer_pure_change(false)
      .build()
}

function bytesToUTxOs() { return (bytes: Uint8Array[]) =>
   bytes.reduce((acc, cur) =>
      (acc.add(cardanoWasm.TransactionUnspentOutput.from_bytes(cur)), acc),
      cardanoWasm.TransactionUnspentOutputs.new())
}

export function wasmQtyFromSupply(supply: number, decimals: number) {
   return cardanoWasm.BigNum.from_str(supply.toString())
      .checked_mul(cardanoWasm.BigNum.from_str(Math.pow(10, decimals).toString()))
}

type SelectionResult = {
   input: TransactionUnspentOutput[]
   output: TransactionOutputs
   remaining: TransactionUnspentOutput[]
   amount: Value
   change: Value
}

async function pickUtxos(cardanoParams: ProtocolParams, walletUTxOs: TransactionUnspentOutput[],
   receiver: Address, toMint: WasmTokenDeltaParam[], continuing: WasmTokenParam[], extra: WasmAssets[],
   fee: BigNum) {
   const totalAssets = 0

   CoinSelection.setProtocolParameters(
      cardanoParams.coinsPerUtxoWord.toString(),
      cardanoParams.minFeeA.toString(), // linearFee.coefficient().to_str(),
      cardanoParams.minFeeB.toString(), // linearFee.constant().to_str(),
      cardanoParams.maxTxSize.toString()
   )

   const fakeOutputs = cardanoWasm.TransactionOutputs.new();
   {
      const fakeAssetName = fakeHash
      toMint = toMint.map(a => ([a[0], a[1], a[2] ?? fakeAssetName, a[3], a[4]]))

      const fakeMintedValue = cardanoWasm.Value.new(cardanoWasm.BigNum.from_str('0'))
      const multiAsset = cardanoWasm.MultiAsset.new()

      const multiAssetInsert = (scriptHash: ScriptHash, assetName: AssetName, qty: BigNum) =>
      {
         const mintedAssets = cardanoWasm.Assets.new()
         mintedAssets.insert(
            assetName,
            qty
         )
         multiAsset.insert(scriptHash, mintedAssets)
      }
      toMint.forEach(([, hash, asset, qty,]) =>
         multiAssetInsert(hash, cardanoWasm.AssetName.new(asset), qty))
      continuing.forEach(([, hash, asset, qty,]) =>
         multiAssetInsert(hash, cardanoWasm.AssetName.new(asset), qty))
      extra.forEach((p) =>
         p[1].forEach(a =>
            multiAssetInsert(p[0], a[0], a[1])))

      fakeMintedValue.set_multiasset(multiAsset)
      const minAda = cardanoWasm.min_ada_required(fakeMintedValue, false, toBigNum(cardanoParams.coinsPerUtxoWord))
      //console.log('Min ADA: ' + minAda.to_str())
      //fakeMintedValue.set_coin(minAda)
      // ======

      fakeOutputs.add(
         cardanoWasm.TransactionOutput.new(
            receiver,
            cardanoWasm.Value.new(minAda.checked_add(fee))
         )
      )
   }
   const selection = await CoinSelection.randomImprove(
      walletUTxOs,
      fakeOutputs,
      20 + totalAssets
   )
   return selection as SelectionResult
}

const wasmLovelaceValue = (v: number) => cardanoWasm.Value.new(cardanoWasm.BigNum.from_str(v.toString()))

export const toBigNum = (n: number) => cardanoWasm.BigNum.from_str(n.toString())

const showValue = (v: Value) => showCardanoValue(assetsCardanoValue(valueWasmAssets(v)))

// https://github.com/Emurgo/cardano-serialization-lib/issues/303
function mintRedeemer(index: number, redeemerData: PlutusData, units?: ExUnits) {
   // redeemer itself
   const redeemer = cardanoWasm.Redeemer.new(
      cardanoWasm.RedeemerTag.new_mint(),
      toBigNum(index),
      redeemerData,
      cardanoWasm.ExUnits.new(
         toBigNum(units?.memory ?? 0),
         toBigNum(units?.steps ?? 0)
      )
   )

   return redeemer
}

function setCollateral(txBuilder: TransactionBuilder, utxos: TransactionUnspentOutput[]) {
   const inputs = cardanoWasm.TransactionInputs.new();
   utxos.forEach((utxo) => {
     inputs.add(utxo.input())
     txBuilder.add_address_witness(utxo.output().address())
   })
   txBuilder.set_collateral(inputs)
}

function makeCostModel(pp: ProtocolParams) {
   const costmdls = cardanoWasm.Costmdls.new()
   const costmdl = cardanoWasm.CostModel.new()
   pp.costModel.forEach((cost, index) => {
     costmdl.set(index, cardanoWasm.Int.new_i32(cost))
   })
   costmdls.insert(cardanoWasm.Language.new_plutus_v1(), costmdl)
   return costmdls
}

export const rejectWith = (e: unknown) => Promise.reject(e['info'] ?? e['message'] ?? (typeof e === 'string' ? e : JSON.stringify(e)))

export type MintTransactionBuilder = {
   assetName: Uint8Array
   txBuilder: (metadata?: CardanoMetadata) => Promise<Transaction>
}

export async function sendTransaction(wallet: WalletCIP30Api, tx: Uint8Array) {
   try {
      return wallet.instance.submitTx(unsafeCbor(tx))
      // return await wallet.instance.submitTx(unsafeCborHex(utf8BytesToHex(tx)))
   } catch (e) {
      console.log(JSON.stringify(e))
      return rejectWith(e)
   }
}

async function performCoinSelection(cardanoParams: ProtocolParams, walletUTxOs: TransactionUnspentOutput[],
   receiver: Address, toMint: WasmTokenDeltaParam[], continuing: WasmTokenParam[], extra: WasmAssets[],
   fee: BigNum) {
   const selection = await pickUtxos(cardanoParams, walletUTxOs, receiver, toMint, continuing, extra, fee)
   const utxos = selection.input
   const inUTxOsMultiAssets = [].concat(...utxos.map(u => valueWasmAssetsOnly(u.output().amount())))

   if (utxos.length === 0) {
      throw new Error('Wallet has no suitable UTxOs!')
   }

   const utxosTotalLovelace = utxos.reduce((acc, cur) =>
      acc.checked_add(cur.output().amount().coin()),
      toBigNum(0))

   return {
      utxos,
      inUTxOsMultiAssets,
      outChangeLovelace: utxosTotalLovelace.checked_sub(fee)
   }
}

// Evaluate tx cost and fee
export async function preEvaluateTx(cardanoParams: ProtocolParams, tx: Transaction) {
   const ogmios = await makeOgmiosContext().then(createTxSubmissionClient)
   const evaluatedUnits = await ogmios.evaluateTx(toHex(tx.to_bytes()))
   ogmios.shutdown()
   console.log(evaluatedUnits)
   const mintRedeemerExs = Object.entries(evaluatedUnits)
      .map(([k, v]) => {
         const [tag, id] = k.split(':', 2)
         return tuple(tag, id, v)
      })
      .filter(([tag,,]) => tag === 'mint')
      .sort(compareNumber(([,id,]) => Number.parseInt(id)))
      .map(([,,ex]) => ex)
   console.log('mintRedeemerExs')
   console.log(mintRedeemerExs)
   const totalExUnits = mintRedeemerExs.reduce((acc, cur) =>
      ({ memory: acc.memory + cur.memory, steps: acc.steps + cur.steps }),
      { memory: 0, steps: 0 })
   console.log('totalExUnits')
   console.log(totalExUnits)
   console.log(tx.to_bytes().length)
   console.log(toHex(tx.to_bytes()).length)
   return {
      mintRedeemerExs,
      fee: calculateFee(cardanoParams, tx, totalExUnits)
   }
}

export type TxUnknowns = {
   fee: BigNum,
   mintRedeemerExs: ExUnits[]
}

// https://githubhot.com/repo/Emurgo/cardano-serialization-lib/issues/303
export async function buildUnknownMintTransaction(
   cardanoParams: ProtocolParams,
   wallet: WalletCIP30Api,
   builderConfig: TransactionBuilderConfig,
   toMint: WasmTokenDeltaParam[],
   continuing: WasmTokenParam[],
   unknowns?: TxUnknowns) {
   const receiver = mapUncbor(cardanoWasm.Address.from_bytes)
      (await wallet.instance.getUsedAddresses())[0]
   if (!receiver) {
      throw new Error('Receive address not found!')
   }

   // ==============
   const walletUTxOs = mapUncbor(cardanoWasm.TransactionUnspentOutput.from_bytes)
      (await wallet.instance.getUtxos())

   const fee = unknowns?.fee ?? toBigNum(500000)
   const { utxos, inUTxOsMultiAssets, outChangeLovelace } =
      await performCoinSelection(cardanoParams, walletUTxOs, receiver, toMint, continuing, [], fee)
   // ===============

   const newAssetName = utxoIdToRawBytes(utxos[0])

   toMint = toMint.map(a => ([a[0], a[1], a[2] ?? newAssetName, a[3], a[4]]))

   const txBuilder = cardanoWasm.TransactionBuilder.new(builderConfig)
   const mintedValue = wasmLovelaceValue(0)
   const multiAsset = cardanoWasm.MultiAsset.new()

   const multiAssetUpdate = (scriptHash: ScriptHash, assetName: Uint8Array, qty: BigNum, positive: boolean) =>
   {
      // const mintedAssets = cardanoWasm.Assets.new()
      const _assetName = cardanoWasm.AssetName.new(assetName)
      const old = multiAsset.get_asset(scriptHash, _assetName)
      multiAsset.set_asset(scriptHash, _assetName, positive ? old.checked_add(qty) : old.checked_sub(qty)) 
   }
   const multiAssetInsert = (scriptHash: ScriptHash, assetName: Uint8Array, qty: BigNum) =>
   {
      const _assetName = cardanoWasm.AssetName.new(assetName)
      multiAsset.set_asset(scriptHash, _assetName, qty) 
   }
   inUTxOsMultiAssets.forEach(([a, bs]) => { // Needed if input UTxOs contain native assets
      bs.forEach(([b, c]) => multiAsset.set_asset(a, b, c))
   })
   toMint.forEach(([,hash, asset, qty, positive]) => multiAssetUpdate(hash, asset, qty, positive))
   continuing.forEach(([,hash, asset, qty]) => multiAssetInsert(hash, asset, qty))

   mintedValue.set_multiasset(multiAsset)
   mintedValue.set_coin(outChangeLovelace)

   const mint = cardanoWasm.Mint.new()
   const mintInsert = (scriptHash: ScriptHash, assetName: Uint8Array, qty: BigNum, positive: boolean) => {
      const mintAssets = cardanoWasm.MintAssets.new()
      mintAssets.insert(
         cardanoWasm.AssetName.new(assetName),
         positive ? cardanoWasm.Int.new(qty) : cardanoWasm.Int.new_negative(qty)
      )
      mint.insert(scriptHash, mintAssets)
   }
   toMint.forEach(([,hash, asset, qty, positive]) => mintInsert(hash, asset, qty, positive))

   {
      txBuilder.add_output(cardanoWasm.TransactionOutput.new(receiver, mintedValue))
   }

   const plutusScripts = toMint.reduce((acc, cur) =>
      (acc.add(cur[0]), acc), cardanoWasm.PlutusScripts.new())
   txBuilder.set_plutus_scripts(plutusScripts)
   utxos.forEach(utxo =>
      txBuilder.add_input(utxo.output().address(), utxo.input(), utxo.output().amount()))

   // =====
   const collateral = mapUncbor(cardanoWasm.TransactionUnspentOutput.from_bytes)
      (await wallet.instance.getCollateral({amount: 1500000}))
   if (collateral.length <= 0) {
      throw new Error("No available collateral!")
   }
   setCollateral(txBuilder, collateral.slice(0, 2))

   txBuilder.set_fee(fee)

   // =====

   return {
      assetName: newAssetName,
      txBuilder: async (metadata: CardanoMetadata) => {
         let auxiliaryData: AuxiliaryData
         if (metadata) {
            auxiliaryData = cardanoWasm.AuxiliaryData.new()
            const txMetadata = cardanoWasm.GeneralTransactionMetadata.new()
            Object.entries(metadata).forEach(([key, val]) =>
            txMetadata.insert(cardanoWasm.BigNum.from_str(key), cardanoWasm.encode_json_str_to_metadatum(JSON.stringify(val), MetadataJsonSchema.BasicConversions)))

            auxiliaryData.set_metadata(txMetadata)

            txBuilder.set_auxiliary_data(auxiliaryData)
         }

         const witnessSet = cardanoWasm.TransactionWitnessSet.new()

         const setRedeemers = (txBuilder: TransactionBuilder, redeemerExs: [PlutusData, ExUnits][]) => {
            const redeemers = cardanoWasm.Redeemers.new()
            redeemerExs.forEach((r, i) => redeemers.add(mintRedeemer(i, r[0], r[1])))
            txBuilder.set_redeemers(redeemers)
            txBuilder.set_plutus_scripts(plutusScripts)

            witnessSet.set_plutus_scripts(plutusScripts)
            witnessSet.set_redeemers(redeemers)
         }

         const redeemerExs = unknowns?.mintRedeemerExs
            ?? toMint.map(() => ({ memory: 0, steps: 0}))

         // const mintPlutusData = cardanoWasm.PlutusData.new_constr_plutus_data(cardanoWasm.ConstrPlutusData.new(
         //    cardanoWasm.BigNum.from_str('0'),
         //    cardanoWasm.PlutusList.new()
         // ))
         const mintPlutusData = cardanoWasm.PlutusData.new_integer(cardanoWasm.BigInt.from_str('0'))

         setRedeemers(txBuilder, redeemerExs.map(ex => tuple(mintPlutusData, ex)))

         const txBody = txBuilder.build()
         txBody.set_mint(mint)

         return cardanoWasm.Transaction.new(
            txBody,
            witnessSet, // cardanoWasm.TransactionWitnessSet.from_bytes(witnessSet.to_bytes()),
            auxiliaryData
         )
      }
   }
}

export async function signTx(wallet: WalletCIP30Api, tx: Transaction) {
   const witnessSet = tx.witness_set()

   const txVkeyWitnessSet = uncbor(cardanoWasm.TransactionWitnessSet.from_bytes)
      (await wallet.instance.signTx(tocbor(tx, v => v.to_bytes()), true)
      .catch(rejectWith))

   witnessSet.set_vkeys(txVkeyWitnessSet.vkeys())

   const signedTx = cardanoWasm.Transaction.new(
      tx.body(), // txBody
      witnessSet,
      tx.auxiliary_data()
   )

   return signedTx
}

export type WasmTokenParam = [PlutusScript, ScriptHash, Uint8Array, BigNum]
export type WasmTokenDeltaParam = [PlutusScript, ScriptHash, Uint8Array, BigNum, boolean]
export const wasmTokenParam = (a: TokenParam) => tuple(
   cardanoWasm.PlutusScript.from_bytes(fromHex(a.policy)), uncbor(cardanoWasm.ScriptHash.from_bytes)(unsafeCborHex(a.policyId)), a.assetName, cardanoWasm.BigNum.from_str(a.qty))
   export const wasmTokenDeltaParam = (a: TokenDeltaParam) => tuple(
   cardanoWasm.PlutusScript.from_bytes(fromHex(a.policy)), uncbor(cardanoWasm.ScriptHash.from_bytes)(unsafeCborHex(a.policyId)), a.assetName, cardanoWasm.BigNum.from_str(a.qty), a.positive)


const errorIgnoreList = ['underflow']

export const runIgnoreErrors = <T, R>(f: (arg?: T) => Promise<R>) => async (arg?: T): Promise<R> =>
   f(arg)
      .catch(rejectWith)
      .catch(async e =>
         errorIgnoreList.includes(e)
            ? runIgnoreErrors(f)(arg)
            : Promise.reject(e))

export const minimumFeeRegEx = /FeeTooSmallUTxO \(Coin (\d+)/

export function calculateFee(cardanoParams: ProtocolParams, tx: Transaction, cost: ExUnits) {
   const txBytesLength = tx.to_bytes().length
   const p = cardanoParams
   const sendTxOverhead = 15 // bytes
   return toBigNum(Math.ceil((txBytesLength + sendTxOverhead) * p.minFeeA + cost.memory * p.priceMem + cost.steps * p.priceStep + p.minFeeB))
}