import SHARED_DATA from '@/graphql/shared-data/sharedData.gql'
import SHARED_DATA_UPDATE from '@/graphql/shared-data/sharedDataUpdate.gql'
import SHARED_DATA_UPDATED from '@/graphql/shared-data/sharedDataUpdated.gql'
import CURRENT_PROJECT_ID from '@/graphql/project/currentProjectId.gql'

function genQuery (id, projectId) {
  return {
    query: SHARED_DATA,
    variables: {
      id,
      projectId
    },
    update: ({ sharedData }) => (sharedData && sharedData.value) || undefined,
    subscribeToMore: {
      document: SHARED_DATA_UPDATED,
      variables: {
        id,
        projectId
      },
      updateQuery: (previousResult, { subscriptionData }) => {
        return {
          sharedData: subscriptionData.data.sharedDataUpdated
        }
      }
    }
  }
}

export default {
  install (Vue) {
    Vue.mixin({
      data () {
        return {
          $sharedData: {}
        }
      },

      beforeCreate () {
        Object.defineProperty(this, '$sharedData', {
          get: () => this.$data.$sharedData,
          enumerable: true,
          configurable: true
        })
      },

      async created () {
        const options = this.$options.sharedData
        if (options) {
          if (typeof options === 'function') {
            let smartQueries
            this.$watch(options.bind(this), async result => {
              if (smartQueries) {
                smartQueries.forEach(s => s.destroy())
              }
              smartQueries = await this.$syncSharedData(result)
            }, {
              immediate: true
            })
          } else {
            await this.$syncSharedData(options)
          }
          // Force watchers to re-evaluate
          // Because we just added the proxies to this.$data.$sharedData[key]
          this._watchers.forEach(watcher => {
            watcher.update()
          })
        }
      },

      methods: {
        $getProjectId () {
          return new Promise((resolve) => {
            const client = this.$apollo.getClient()
            const observable = client.watchQuery({
              query: CURRENT_PROJECT_ID
            })
            const sub = observable.subscribe({
              next ({ data }) {
                if (data.currentProjectId) {
                  sub.unsubscribe()
                  resolve(data.currentProjectId)
                }
              }
            })
          })
        },

        async $getSharedData (id) {
          const projectId = await this.$getProjectId()
          const result = await this.$apollo.query({
            query: SHARED_DATA,
            variables: {
              id,
              projectId
            }
          })
          return result.sharedData.value
        },

        async $watchSharedData (id, cb) {
          const projectId = await this.$getProjectId()
          return this.$apollo.addSmartQuery(id, {
            ...genQuery(id, projectId),
            manual: true,
            result: ({ data }) => {
              data && data.sharedData && cb(data.sharedData.value)
            }
          })
        },

        async $setSharedData (id, value) {
          const projectId = await this.$getProjectId()
          return this.$apollo.mutate({
            mutation: SHARED_DATA_UPDATE,
            variables: {
              id,
              value,
              projectId
            }
          })
        },

        async $syncSharedData (options) {
          for (const key in options) {
            const id = options[key]
            this.$set(this.$data.$sharedData, key, null)
            // Proxy
            Object.defineProperty(this, key, {
              get: () => this.$data.$sharedData[key],
              set: value => {
                this.$set(this.$data.$sharedData, key, value)
                this.$setSharedData(id, value)
              },
              enumerable: true,
              configurable: true
            })
          }
          const projectId = await this.$getProjectId()
          const smartQueries = []
          for (const key in options) {
            const id = options[key]
            const smartQuery = this.$apollo.addSmartQuery(key, {
              ...genQuery(id, projectId),
              update: undefined,
              manual: true,
              result: (result) => {
                if (result && result.data) {
                  const { data: { sharedData } } = result
                  const value = (sharedData && sharedData.value) || undefined
                  this.$set(this.$data.$sharedData, key, value)
                }
              }
            })
            smartQueries.push(smartQuery)
          }
          return smartQueries
        }
      }
    })

    window.mapSharedData = (namespace, options) => {
      const result = {}
      for (const key in options) {
        result[key] = namespace + options[key]
      }
      return result
    }
  }
}
