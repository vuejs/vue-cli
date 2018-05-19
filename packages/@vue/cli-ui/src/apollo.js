import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { WebSocketLink } from 'apollo-link-ws'
import { withClientState } from 'apollo-link-state'
import defaults from './state/defaults'
import resolvers from './state/resolvers'

// Create the apollo client
export default function createApolloClient ({ base, endpoints, persisting }) {
  // Apollo cache
  const cache = new InMemoryCache()

  // Client-side state
  const stateLink = withClientState({ defaults, cache, resolvers })

  // Web socket
  const wsClient = new SubscriptionClient(base.replace(/^https?/i, 'ws') +
  endpoints.subscription, {
    reconnect: true
  })

  // Create the subscription websocket link
  const wsLink = new WebSocketLink(wsClient)

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([stateLink, wsLink]),
    cache
  })

  return apolloClient
}
