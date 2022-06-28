// https://stackoverflow.com/questions/57510388/define-prefix-for-object-keys-using-types-in-typescript

// type addPrefix<TKey, TPrefix extends string> = TKey extends string
//   ? `${TPrefix}${TKey}`
//   : never;

// type removePrefix<TPrefixedKey, TPrefix extends string> = TPrefixedKey extends addPrefix<infer TKey, TPrefix>
//   ? TKey
//   : '';

// type prefixedValue<TObject extends object, TPrefixedKey extends string, TPrefix extends string> = TObject extends {[K in removePrefix<TPrefixedKey, TPrefix>]: infer TValue}
//   ? TValue
//   : never;

// type addPrefixToObject<TObject extends object, TPrefix extends string> = {
//   [K in addPrefix<keyof TObject, TPrefix>]: prefixedValue<TObject, K, TPrefix>
// } 
export type addPrefixToObject<T, P extends string> = {
   [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
}

export type AnyPrefixed<P extends string, T> = addPrefixToObject<Record<string, T>, P>