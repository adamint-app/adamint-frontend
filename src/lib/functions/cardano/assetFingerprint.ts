import AssetFingerprint from '@emurgo/cip14-js'
import { fromHex, toHex_ } from '../bytes'

export function assetFingerprint(policyId: string, assetName: string) {
   return AssetFingerprint.fromParts(
      fromHex(policyId),
      fromHex(assetName)
   ).fingerprint()
}