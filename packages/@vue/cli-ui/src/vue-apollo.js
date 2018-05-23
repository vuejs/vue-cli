import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'

// Install the vue plugin
Vue.use(VueApollo)

let endpoint = process.env.VUE_APP_GRAPHQL_WS
if (typeof endpoint === 'undefined') {
  endpoint = 'ws://localhost:4000/graphql'
} else if (endpoint === '') {
  endpoint = window.location.origin.replace('http', 'ws') + '/graphql'
}

// Config
const options = {
  wsEndpoint: endpoint,
  persisting: false,
  websocketsOnly: true
}

// Create apollo client
export const { apolloClient } = createApolloClient(options)

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})
