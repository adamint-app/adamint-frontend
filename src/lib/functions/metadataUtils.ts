import type { CardanoMetadata, TokenMetadataPayload, TokenMetadataType } from "$lib/types/cardano/metadata"
import type { MetadataCIP25 } from "$lib/types/cardano/metadata/cip25"
import type { MetadataCIP38 } from "$lib/types/cardano/metadata/cip38"
import type { VariadicProduct } from "$lib/types/variadicProduct"
import { deepmerge } from 'deepmerge-ts'

const emptyTokenMetatadata = <T extends TokenMetadataType<TokenMetadataPayload<T>>>(label: string, policyId: string, assetName: string) =>
   (obj: TokenMetadataPayload<T>) =>
      ({
         [label]: {
            [policyId]: {
               [assetName]: obj
            }
         }
      }) as T

export const cip25label = '721'
export const initCIP25 = (policyId: string, assetName: string) => (obj: TokenMetadataPayload<MetadataCIP25>, version: string) => {
   const data = emptyTokenMetatadata<MetadataCIP25>(cip25label, policyId, assetName)(obj)
   data[cip25label].version = version
   return data
}

export const cip38label = '20'
export const initCIP38 = (policyId: string, assetName: string) =>
   emptyTokenMetatadata<MetadataCIP38>(cip38label, policyId, assetName)

// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
export const mergeMetadata = <T extends CardanoMetadata[]>(data: [...T]) => deepmerge<T>(...data) // as VariadicProduct<T>
