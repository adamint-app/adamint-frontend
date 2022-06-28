import { trimEnd } from "./string"

export function formatDecimals(separator: string, int: string, decimals?: number) {
   if (decimals !== 0 && !decimals) return int
   const pos = int.length - decimals
   return trimEnd(
         pos <= 0 ? '0' + separator + '0'.repeat(-pos) + int :
         pos > 0 && decimals > 0 ? int.slice(0, pos) + separator + int.slice(pos) :
         int + separator
      , '0') + '0'
}