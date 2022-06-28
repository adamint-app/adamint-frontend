
export type CardanoMetadata = Record<number, unknown>

export type TokenMetadataType<X> = {
   [x in string | number | symbol]: { [x: string]: { [x: string]: X} } 
}

export type TokenMetadataPayload<T> = T extends TokenMetadataType<infer X> ? X : never
export type TokenMetadataBody<T> = T extends TokenMetadataType<infer X> ? { [x: string]: { [x: string]: X} } : never