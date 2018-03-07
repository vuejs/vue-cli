import { ApolloClient } from 'apollo-client'
import { split, ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { withClientState } from 'apollo-link-state'
import defaults from './state/defaults'
import resolvers from './state/resolvers'

// Create the apollo client
export default function createApolloClient ({ base, endpoints, persisting }) {
  let link
  let wsClient

  let httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
  })

  // Apollo cache
  const cache = new InMemoryCache()

  // Client-side state
  const stateLink = withClientState({ defaults, cache, resolvers })

  // Web socket
  wsClient = new SubscriptionClient(base.replace(/^https?/i, 'ws' + (process.env.NODE_ENV === 'production' ? 's' : '')) +
  endpoints.subscription, {
    reconnect: true
  })

  // Create the subscription websocket link
  const wsLink = new WebSocketLink(wsClient)

  link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' &&
        operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([stateLink, link]),
    cache
  })

  return apolloClient
}
