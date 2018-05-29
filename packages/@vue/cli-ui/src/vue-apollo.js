import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'
import clientStateDefaults from './state/defaults'
import clientStateResolvers from './state/resolvers'
import CONNECTED_SET from './graphql/connectedSet.gql'

// Install the vue plugin
Vue.use(VueApollo)

let endpoint = process.env.VUE_APP_CLI_UI_URL
if (typeof endpoint === 'undefined') {
  endpoint = 'ws://localhost:4000/graphql'
} else if (endpoint === '') {
  endpoint = window.location.origin.replace('http', 'ws') + '/graphql'
}

// Config
const options = {
  wsEndpoint: endpoint,
  persisting: false,
  websocketsOnly: true,
  clientState: {
    defaults: clientStateDefaults,
    resolvers: clientStateResolvers
  }
}

// Create apollo client
export const { apolloClient, wsClient } = createApolloClient(options)

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

/* Connected state */

function setConnected (value) {
  apolloClient.mutate({
    mutation: CONNECTED_SET,
    variables: {
      value
    }
  })
}

wsClient.on('connected', () => setConnected(true))
wsClient.on('reconnected', () => setConnected(true))
// Offline
wsClient.on('disconnected', () => setConnected(false))
wsClient.on('error', () => setConnected(false))
