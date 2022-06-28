import type { WalletCandidate } from "$lib/functions/walletUtils"

export declare global {
   interface Window {
      cardano: Record<string, WalletCandidate>
   }
}