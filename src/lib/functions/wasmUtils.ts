import type { CardanoWasm } from "$lib/types/cardano/wasm"
import type { AssetName, BigNum, ScriptHash, Value, TransactionUnspentOutput } from '$lib/../../node_modules/cardano-serialization-lib'
import { Buffer } from 'buffer'
import js_sha3 from 'js-sha3'
import { tuple } from "./tuple"

const { sha3_256 } = js_sha3

export type WasmAssets = [ScriptHash, [AssetName, BigNum][]]

export function fromWasmUTxOId(utxo: TransactionUnspentOutput) {
   return {
      address: utxo.input().transaction_id().to_bech32(''),
      // address: toHex(utxo.input().transaction_id().to_bytes()),
      index: utxo.input().index()
   }
}

export function valueWasmAssets(value: Value): WasmAssets[] {
   if (value.is_zero()) {
      return []
   }
   let allAssets = (() => {
      const policy = cardanoWasm.ScriptHash.from_bytes(
         Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
      )
      const assetName = cardanoWasm.AssetName.new(Buffer.from('00', 'hex'))
      return [tuple(policy, [tuple(assetName, value.coin())])]
   })()
   allAssets = valueWasmAssetsOnly(value).concat(allAssets)
   return allAssets
}

export function valueWasmAssetsOnly(value: Value): WasmAssets[] {
   if (value.is_zero()) {
      return []
   }
   const multi = value.multiasset()
   if (multi) {
      const policies = multi.keys()
      const retrievedPolicies = new Array<WasmAssets>(policies.len())
      for (let i = 0; i < policies.len(); ++i) {
         const policy = policies.get(i)
         const policyAssets = multi.get(policy)
         const assetNames = policyAssets.keys()
         const retrievedAssets = new Array<[AssetName, BigNum]>(assetNames.len())
         for (let j = 0; j < assetNames.len(); ++j) {
            const assetName = assetNames.get(j)
            retrievedAssets[j] = [assetName, policyAssets.get(assetName)]
         }
         retrievedPolicies[i] = [policy, retrievedAssets]
      }
      return retrievedPolicies
   }
   return []
}

export function assetsCardanoValue(value: WasmAssets[]) {
   return value.reduce((acc, cur) => acc.set(getPolicyId(cur[0]), 
      cur[1].reduce((acc2, cur2) => acc2.set(getAssetName(cur2[0]),
         cur2[1].to_str()),
         new Map<string, string>())),
      new Map<string, Map<string, string>>())
}

// function assetsToStrings(value: WasmAssets[]): [string, [string, string][]][] {
//    return value.map(([policy, assets]) => [
//       getPolicyId(policy),
//       assets.map(([assetName, qty]) => [getAssetName(assetName), qty.to_str()])
//    ])
// }

export function getPolicyId(scriptHash: ScriptHash): string {
   return (() => Buffer)().from(scriptHash.to_bytes()).toString('hex');
}

export function getAssetName(assetName: AssetName): string {
   // return Buffer.from(assetName.name(), 'hex').toString()
   return (() => Buffer)().from(assetName.name()).toString('hex');
}
// ========

const quot = (a: number, b: number) => ~~(a / b)

const rem = (a: number, b: number) => (a / b) % 1

// const consByteString = (i: number, bytestring: string) => {
//    return toHex(new Uint8Array([i])) + bytestring
// }
// const digitToHex = (i: number) => consByteString(i + 48, "")
// const integerToHex = (i: number): string =>
//    i < 0 ? consByteString(45, integerToHex(-i)) :
//    quot(i, 10) == 0 ? digitToHex(i) :
//       integerToHex(quot(i, 10)) + digitToHex(rem(i, 10))
// function utxoIdToString (o: {address: string /* bech32 */, index: number}) {
//    return o.address //+ integerToHex(o.index)
// }

function concatArray(a: Uint8Array, b: Uint8Array) {
   const c = new Uint8Array(a.length + b.length)
   c.set(a, 0)
   c.set(b, a.length)
   return c
}

const consBytes = (i: number, bytestring: Uint8Array) =>
   concatArray(new Uint8Array([i]), bytestring)

const digitToByte = (i: number) => new Uint8Array([i + 48])
const integerToByte = (i: number): Uint8Array =>
   i < 0 ? consBytes(45, integerToByte(-i)) :
   quot(i, 10) == 0 ? digitToByte(i) :
   concatArray(integerToByte(quot(i, 10)), digitToByte(rem(i, 10)))
export function utxoIdToBytes (u: TransactionUnspentOutput) {
   return concatArray(u.input().transaction_id().to_bytes(), integerToByte(u.input().index()))
}

const digitToRawByte = (i: number) => new Uint8Array([i])
const integerToRawByte = (base: number, i: number): Uint8Array =>
   i < 0 ? consBytes(0, integerToRawByte(base, -i)) :
   quot(i, base) == 0 ? digitToRawByte(i) :
   concatArray(integerToRawByte(base, quot(i, base)), digitToRawByte(rem(i, base)))

export function utxoIdToRawBytes (u: TransactionUnspentOutput) {
   // return new Uint8Array(sha3_256.arrayBuffer(
   //    concatArray(u.input().transaction_id().to_bytes(), integerToRawByte(256, u.input().index()))
   // ))
   return concatArray(digitToRawByte(u.input().index()), u.input().transaction_id().to_bytes().slice(0, 31))
}

export const fakeHash = new Uint8Array(sha3_256.arrayBuffer([0]))

// ========