import Vue from 'vue'
import VueApollo from 'vue-apollo'
import createApolloClient from './apollo'

// Install the vue plugin
Vue.use(VueApollo)

// Config
const options = {
  base: process.env.VUE_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000',
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
