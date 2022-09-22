import { costModelObject } from "$lib/functions/cardano/costModels"
import type { GraphQLClient } from "$lib/services/cardanoGraphQL"
import type { ProtocolParams } from "$lib/types/cardano/network"
// import { gql, GraphQLClient } from "graphql-request"

import { gql } from '@apollo/client/core/index.js'

// import gqlProtocolParams from "$lib/functions/cardanoGraphQL/protocolParams.gql?raw"
/// const gqlProtocolParams = require("$lib/functions/cardanoGraphQL/protocolParams.gql?raw")
const coinsPerUtxoWordField = (network: string) => network === 'mainnet' ? 'coinsPerUtxoWord' : 'coinsPerUtxoByte'
const coinsPerUtxoWordValue = (network: string, p: ProtocolParams): number => network === 'mainnet'
  ? p.coinsPerUtxoWord
  : p['coinsPerUtxoByte']
const gqlProtocolParams = (network: string) => gql(`
query currentEpochProtocolParams {
  cardano {
    currentEpoch {
      number
      protocolParams {
        a0
        ${coinsPerUtxoWordField(network)}
        collateralPercent
        costModels
        decentralisationParam
        eMax
        extraEntropy
        keyDeposit
        maxBlockBodySize
        maxBlockExMem
        maxBlockExSteps
        maxBlockHeaderSize
        maxCollateralInputs
        maxTxExMem
        maxTxExSteps
        maxTxSize
        maxValSize
        minFeeA
        minFeeB
        minPoolCost
        minUTxOValue
        nOpt
        poolDeposit
        priceMem
        priceStep
        protocolVersion
        rho
        tau
      }
    }
  }
}`)

type GQLPP = {cardano: {currentEpoch: {protocolParams : ProtocolParams}}}

export const graphqlProtocolParams = (graphqlClient: GraphQLClient) =>
  (network: string) => graphqlClient.query<GQLPP>(gqlProtocolParams(network))

export const resultProtocolParams = (network: string) => (data: GQLPP) => {
  const p = data.cardano.currentEpoch.protocolParams
  return {...p,
    coinsPerUtxoWord: coinsPerUtxoWordValue(network, p),
    costModel: costModelObject(p.costModels.PlutusV1)
  }
}
