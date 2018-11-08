import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient } from 'vue-cli-plugin-apollo/graphql-client'
import clientStateDefaults from './state/defaults'
import clientStateResolvers from './state/resolvers'
// GraphQL documents
import CONNECTED_SET from '@/graphql/connected/connectedSet.gql'
import LOADING_CHANGE from '@/graphql/loading/loadingChange.gql'
import DARK_MODE_SET from '@/graphql/dark-mode/darkModeSet.gql'
import { getForcedTheme } from './util/theme'

// Install the vue plugin
Vue.use(VueApollo)

let endpoint = process.env.VUE_APP_CLI_UI_URL
if (typeof endpoint === 'undefined') {
  endpoint = `ws://localhost:${process.env.VUE_APP_GRAPHQL_PORT}/graphql`
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
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }
  },
  watchLoading (state, mod) {
    apolloClient.mutate({
      mutation: LOADING_CHANGE,
      variables: {
        mod
      }
    })
  },
  errorHandler (error) {
    console.log('%cAn error occured', 'background: red; color: white; padding: 4px; border-radius: 4px;font-weight: bold;')
    console.log(error.message)
    if (error.graphQLErrors) {
      console.log(error.graphQLErrors)
    }
    if (error.networkError) {
      console.log(error.networkError)
    }
  }
})

export async function resetApollo () {
  console.log('[UI] Apollo store reset')
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // Potential errors
  }
  loadDarkMode()
}

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
wsClient.on('reconnected', async () => {
  await resetApollo()
  setConnected(true)
})
// Offline
wsClient.on('disconnected', () => setConnected(false))
wsClient.on('error', () => setConnected(false))

/* Dark mode */

function loadDarkMode () {
  let enabled, forcedTheme
  if ((forcedTheme = getForcedTheme())) {
    enabled = forcedTheme === 'dark'
  } else {
    const raw = localStorage.getItem('vue-ui-dark-mode')
    enabled = raw === 'true'
  }
  apolloClient.mutate({
    mutation: DARK_MODE_SET,
    variables: {
      enabled
    }
  })
}

loadDarkMode()
