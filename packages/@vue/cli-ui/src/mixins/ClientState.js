import CONNECTED from '@/graphql/connected/connected.gql'
import DARK_MODE from '@/graphql/dark-mode/darkMode.gql'

// @vue/component
export default {
  beforeCreate () {
    if (this.$options.clientState) {
      const newData = {
        connected: CONNECTED,
        darkMode: DARK_MODE
      }
      this.$options.apollo = {
        ...this.$options.apollo,
        ...newData
      }
      // Proxy prop on `this`
      for (const key in newData) {
        Object.defineProperty(this, key, {
          get: () => this.$data.$apolloData.data[key],
          enumerable: true,
          configurable: true
        })
      }
    }
  }
}
