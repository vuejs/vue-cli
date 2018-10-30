import PLUGIN_ACTION_CALL from '@/graphql/plugin/pluginActionCall.gql'
import PLUGIN_ACTION_CALLED from '@/graphql/plugin/pluginActionCalled.gql'
import PLUGIN_ACTION_RESOLVED from '@/graphql/plugin/pluginActionResolved.gql'

let uid = 0

export default {
  install (Vue) {
    Vue.mixin({
      methods: {
        async $callPluginAction (id, params) {
          const result = await this.$apollo.mutate({
            mutation: PLUGIN_ACTION_CALL,
            variables: {
              id,
              params
            }
          })
          return result.data.pluginActionCall
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
