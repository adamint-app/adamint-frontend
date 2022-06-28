//import GQL from '@cardano-graphql/client-ts'
import type {Query} from '@cardano-graphql/client-ts'
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client/core/index.js'

// export function createApolloClient(authToken: string = undefined) {
//    const cache = new InMemoryCache();
//    const link = createHttpLink({
//       uri: 'https://graphql-api.mainnet.dandelion.link',
//       headers: authToken
//          ? {
//            Authorization: `Bearer ${authToken}`,
//          }
//          : undefined,
//    })
//    const client = new ApolloClient({
//       link,
//       cache,
//    })
//    return client
// }

import { SvelteApolloClient } from "svelte-apollo-client";

export const graphqlClient = SvelteApolloClient({
  uri: "https://graphql-api.mainnet.dandelion.link/",
  cache: new InMemoryCache(),
  // headers: {
  //   "Access-Control-Allow-Origin" : "*",
  //   "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
  //   "Access-Control-Allow-Headers": "Content-Type",
  // }
})