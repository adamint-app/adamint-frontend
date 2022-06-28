import { createInteractionContext, createTxSubmissionClient } from '@cardano-ogmios/client'

type PromiseType<T> = T extends Promise<infer R> ? R : never
export type TxSubmissionClient = PromiseType<ReturnType<typeof createTxSubmissionClient>>

export const makeOgmiosContext = () => createInteractionContext(
   err => {
      console.log("Ogmios failed to connect")
      console.error(err)
   },
   () => console.log("Ogmios connection closed."),
   {
      connection: {
         host: 'ogmios-api.mainnet.dandelion.link',
         port: 443,
         tls: true
      }
   }
)