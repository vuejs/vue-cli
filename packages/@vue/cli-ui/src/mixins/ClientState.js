import CONNECTED from '../graphql/connected.gql'
import DARK_MODE from '../graphql/darkMode.gql'

// @vue/component
export default {
  apollo: {
    // In plugins, user `this.$root.connected` for example
    connected: CONNECTED,
    darkMode: DARK_MODE
  }
}
