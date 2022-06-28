import { tuple } from "./tuple"

export function mapIntersect<K, V>(a: Map<K, V>, b: Map<K, V>) {
   const result = new Map<K,V>()
   a.forEach((v, k) => {
      if (b.has(k)) {
         result.set(k, v)
      }
   })
   return result
}

export function mapDiff<K, V>(a: Map<K, V>, b: Map<K, V>) {
   const result = new Map<K,V>()
   a.forEach((v, k) => {
      if (!b.has(k)) {
         result.set(k, v)
      }
   })
   return result
}

export function mapPartition<K, V>(a: Map<K, V>, b: Map<K, V>) {
   const intersect = new Map<K,V>()
   const diff = new Map<K,V>()
   a.forEach((v, k) => {
      b.has(k)
         ? intersect.set(k, v)
         : diff.set(k, v)
   })
   return tuple(intersect, diff)
}