import { fromHex, fromHex_, toHex } from '$lib/functions/bytes'
import type { Address, AssetName, Assets, AuxiliaryData, AuxiliaryDataHash, BaseAddress, BigNum, Bip32PrivateKey, Bip32PublicKey, Ed25519KeyHash, Ed25519Signature, EnterpriseAddress, GeneralTransactionMetadata, hash_auxiliary_data, hash_transaction, Int, LinearFee, make_vkey_witness, MetadataList, MetadataMap, Mint, MintAssets, min_ada_required, min_fee, MultiAsset, NativeScript, NativeScripts, NetworkInfo, PrivateKey, PublicKey, ScriptAll, ScriptAny, ScriptHash, ScriptHashNamespace, ScriptNOfK, ScriptPubkey, StakeCredential, TimelockExpiry, TimelockStart, Transaction, TransactionBody, TransactionBuilder, TransactionHash, TransactionInput, TransactionInputs, TransactionMetadatum, TransactionOutput, TransactionOutputs, TransactionWitnessSet, Value, Vkeywitnesses, TransactionUnspentOutput, TransactionUnspentOutputs } from '$lib/../../node_modules/cardano-serialization-lib'

export type WalletCIP30Api = {
   walletType: 'cip30'
   enable(): Promise<WalletCIP30ApiInstance>
   isEnabled() : Promise<boolean>
   apiVersion(): string
   name: string
   icon: string
   instance?: WalletCIP30ApiInstance
}

class Cbor<T> {
   private _cbor: Uint8Array
   // constructor(cbor: Uint8Array) {
   //    this._cbor = toHex(cbor);
   // }
   static raw = <U>(c: Cbor<U>) => c._cbor as unknown as string
}

export const mapUncbor = <T>(f: (b: Uint8Array) => T) => (cbors: Cbor<T>[]) =>
   cbors.map(uncbor(f))
export const uncbor = <T>(f: (b: Uint8Array) => T) => (cbor: Cbor<T>) =>
   f(fromHex(cbor as unknown as string))
export const uncborHex = <T>(f: (b: Uint8Array) => T) => (hex: string) => f(fromHex(hex))

export const tocbor = <T>(v: T, f: (v: T) => Uint8Array) => unsafeCbor<T>(f(v))
export const unsafeCbor = <T>(b: Uint8Array) => toHex(b) as unknown as Cbor<T>
export const unsafeCborHex = <T>(b: string) => b as unknown as Cbor<T>
export const unsafeCborBytes = <T>(b: Uint8Array) => b as unknown as Cbor<T>

export type Bytes = Uint8Array
export type COSE_Sign1 = unknown
export type COSE_Key = unknown
export type DataSignature = {
   signature:Cbor<COSE_Sign1>
   key: Cbor<COSE_Key>
}

export type Paginate = {
   page: number
   limit: number
}
export type hash32 = string
export type WalletCIP30ApiInstance = {
   getNetworkId(): Promise<number>
   getUtxos(amount?: Cbor<Value>, paginate?: Paginate): Promise<Cbor<TransactionUnspentOutput>[] | undefined>
   // getCollateral(params: {amount: Cbor<string | number>}): Promise<Cbor<TransactionUnspentOutput>[] | undefined>
   getCollateral(params: {amount: string | number}): Promise<Cbor<TransactionUnspentOutput>[] | undefined>
   getBalance() : Promise<Cbor<Value>>
   getUsedAddresses(paginate?: Paginate): Promise<Cbor<Address>[]>
   getUnusedAddresses(): Promise<Cbor<Address>[]>
   getChangeAddress(): Promise<Cbor<Address>>
   getRewardAddresses(): Promise<Cbor<Address>[]>
   signTx(tx: Cbor<Transaction>, partialSign?: boolean): Promise<Cbor<TransactionWitnessSet>>
   signData(addr: Address, payload: Bytes): Promise<Cbor<DataSignature>>
   submitTx(tx: Cbor<Transaction>): Promise<hash32>
}