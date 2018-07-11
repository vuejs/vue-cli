import PLUGIN_ACTION_CALL from '../graphql/pluginActionCall.gql'
import PLUGIN_ACTION_CALLED from '../graphql/pluginActionCalled.gql'
import PLUGIN_ACTION_RESOLVED from '../graphql/pluginActionResolved.gql'

let uid = 0

export default {
  install (Vue) {
    Vue.mixin({
      methods: {
        $callPluginAction (id, params) {
          return this.$apollo.mutate({
            mutation: PLUGIN_ACTION_CALL,
            variables: {
              id,
              params
            }
          })
        },
        $onPluginActionCalled (cb) {
          return this.$apollo.addSmartSubscription(`plugin-action-called-${uid++}`, {
            query: PLUGIN_ACTION_CALLED,
            result: ({ data }) => cb(data.pluginActionCalled)
          })
        },
        $onPluginActionResolved (cb) {
          return this.$apollo.addSmartSubscription(`plugin-action-resolved-${uid++}`, {
            query: PLUGIN_ACTION_RESOLVED,
            result: ({ data }) => cb(data.pluginActionResolved)
          })
        }
      }
    })
  }
}
