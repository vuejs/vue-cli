import Vue from 'vue'
import VueApollo from 'vue-apollo'
import createApolloClient from './apollo'

// Install the vue plugin
Vue.use(VueApollo)

let base = process.env.VUE_APP_GRAPHQL_ENDPOINT
if (typeof base === 'undefined') {
  base = 'http://localhost:4000'
} else if (base === '') {
  base = window.location.origin
}

// Config
const options = {
  base,
  endpoints: {
    graphql: process.env.VUE_APP_GRAPHQL_PATH || '/graphql',
    subscription: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  },
  persisting: false
}

// Create apollo client
export const apolloClient = createApolloClient(options)

// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})
