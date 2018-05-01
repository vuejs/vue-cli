import SHARED_DATA from '../graphql/sharedData.gql'
import SHARED_DATA_UPDATE from '../graphql/sharedDataUpdate.gql'
import SHARED_DATA_UPDATED from '../graphql/sharedDataUpdated.gql'

function genQuery (id) {
  return {
    query: SHARED_DATA,
    variables: {
      id
    },
    fetchPolicy: 'cache-and-network',
    update: ({ sharedData }) => (sharedData && sharedData.value) || undefined,
    subscribeToMore: {
      document: SHARED_DATA_UPDATED,
      variables: {
        id
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

      created () {
        const options = this.$options.sharedData
        if (options) {
          if (typeof options === 'function') {
            let smartQueries
            this.$watch(options.bind(this), result => {
              if (smartQueries) {
                smartQueries.forEach(s => s.destroy())
              }
              smartQueries = this.$syncSharedData(result)
            }, {
              immediate: true
            })
          } else {
            this.$syncSharedData(options)
          }
        }
      },

      methods: {
        async $getSharedData (id) {
          const result = await this.$apollo.query({
            query: SHARED_DATA,
            variables: {
              id
            }
          })
          return result.sharedData.value
        },

        $watchSharedData (id, cb) {
          return this.$apollo.addSmartQuery(id, {
            ...genQuery(id),
            manual: true,
            result: ({ data }) => {
              data && data.sharedData && cb(data.sharedData.value)
            }
          })
        },

        $setSharedData (id, value) {
          return this.$apollo.mutate({
            mutation: SHARED_DATA_UPDATE,
            variables: {
              id,
              value
            }
          })
        },

        $syncSharedData (options) {
          const smartQueries = []
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
            const smartQuery = this.$apollo.addSmartQuery(key, {
              ...genQuery(id),
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
