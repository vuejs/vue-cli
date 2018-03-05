import { ApolloClient } from 'apollo-client'
import { split, ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient, MessageTypes } from 'subscriptions-transport-ws'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
import { setContext } from 'apollo-link-context'
import { withClientState } from 'apollo-link-state'
import defaults from './state/defaults'
import resolvers from './state/resolvers'

function getAuth () {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('apollo-token')
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : ''
}

function restartWebsockets (wsClient) {
  // Copy current operations
  const operations = Object.assign({}, wsClient.operations)

  // Close connection
  wsClient.close(true)

  // Open a new one
  wsClient.connect()

  // Push all current operations to the new connection
  Object.keys(operations).forEach(id => {
    wsClient.sendMessage(
      id,
      MessageTypes.GQL_START,
      operations[id].options
    )
  })
}

// Create the apollo client
export default function createApolloClient ({ ssr, base, endpoints, persisting }) {
  let link
  let wsClient

  let httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
  })

  // HTTP Auth header injection
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: getAuth()
    }
  }))

  // Concat all the http link parts
  httpLink = authLink.concat(httpLink)
  if (persisting) {
    httpLink = createPersistedQueryLink().concat(httpLink)
  }

  // Apollo cache
  const cache = new InMemoryCache()

  // Client-side state
  const stateLink = withClientState({ defaults, cache, resolvers })

  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }

    // Web socket
    wsClient = new SubscriptionClient(base.replace(/^https?/i, 'ws' + (process.env.NODE_ENV === 'production' ? 's' : '')) +
    endpoints.subscription, {
      reconnect: true,
      connectionParams: () => ({
        'Authorization': getAuth()
      })
    })

    // Create the subscription websocket link
    const wsLink = new WebSocketLink(wsClient)

    // File upload
    const uploadLink = authLink.concat(createUploadLink({
      uri: base + endpoints.graphql
    }))

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    httpLink = split(
      operation => operation.getContext().upload,
      uploadLink,
      httpLink
    )

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
  } else {
    // On the server, we don't want WebSockets
    link = httpLink
  }

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([stateLink, link]),
    cache,
    // Additional options
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
      // Apollo devtools
      connectToDevTools: process.env.NODE_ENV !== 'production'
    })
  })

  apolloClient.$onLogin = token => {
    localStorage.setItem('apollo-token', token)
    if (wsClient) restartWebsockets(wsClient)
  }

  apolloClient.$onLogout = () => {
    localStorage.removeItem('apollo-token')
    if (wsClient) restartWebsockets(wsClient)
    apolloClient.resetStore()
  }

  return apolloClient
}
