import type { addPrefixToObject } from '$lib/types/anyPrefixed'
import _prefixKeys from 'prefix-keys'

// Returns a shallow copy of the object
export function filterObject<K extends string | number | symbol, V>
   (obj: Record<K, V>, pred: (v: V) => boolean) {
   obj = {...obj}
   Object.entries<V>(obj).forEach(([key, val]) => {
      if (!pred(val)) {
         delete obj[key]
      }
   })
   return obj
}

export function objectAny<K extends string | number | symbol, V>
   (obj: Record<K, V>, pred: (v: V) => boolean) {
   return Object.entries<V>(obj).findIndex(([, val]) => pred(val)) !== -1
}

export function objectFirst<K extends string | number | symbol, V>
   (obj: Record<K, V>, pred: (v: V) => boolean) {
   return Object.entries<V>(obj).find(([, val]) => pred(val))
}

export const prefixKeys = <P extends string>(p: string) => <O>(o: O): addPrefixToObject<O, P> =>
   _prefixKeys(p, o)

export const objectArray = <T>(o: Record<number, T>) =>
   Object.keys(o).map(index => o[index] as T)