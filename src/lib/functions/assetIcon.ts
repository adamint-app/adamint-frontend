const maxIconB = 1024 * 64

export function assetIconAllowed(icon: string | ArrayBuffer) {
   if (typeof icon === 'string') {
      const prefixLength = 23
      return icon.length <= prefixLength + maxIconB
   } else {
      return icon.byteLength <= maxIconB
   }
}

export function assetIconBlobAllowed(icon: Blob) {
   return icon.size <= maxIconB
}