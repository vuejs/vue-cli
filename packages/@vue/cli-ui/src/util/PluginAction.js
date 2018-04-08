import PLUGIN_ACTION_CALL from '../graphql/pluginActionCall.gql'
import PLUGIN_ACTION_CALLED from '../graphql/pluginActionCalled.gql'
import PLUGIN_ACTION_RESOLVED from '../graphql/pluginActionResolved.gql'

let uid = 0

export default {
  install (Vue) {
    Vue.mixin({
      methods: {
        $callAction (id, params) {
          return this.$apollo.mutate({
            mutation: PLUGIN_ACTION_CALL,
            variables: {
              id,
              params
            }
          })
        },
        $onActionCalled (cb) {
          return this.$apollo.addSmartSubscription(`plugin-action-called-${uid++}`, {
            query: PLUGIN_ACTION_CALLED,
            result: cb
          })
        },
        $onActionResolved (cb) {
          return this.$apollo.addSmartSubscription(`plugin-action-resolved-${uid++}`, {
            query: PLUGIN_ACTION_RESOLVED,
            result: cb
          })
        }
      }
    })
  }
}
