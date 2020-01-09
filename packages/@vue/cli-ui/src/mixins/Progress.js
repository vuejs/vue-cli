import PROGRESS from '@/graphql/progress/progress.gql'
import PROGRESS_CHANGED from '@/graphql/progress/progressChanged.gql'
import PROGRESS_REMOVED from '@/graphql/progress/progressRemoved.gql'

// @vue/component
export default {
  props: {
    progressId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      progress: null
    }
  },

  apollo: {
    progress: {
      query: PROGRESS,
      variables () {
        return {
          id: this.progressId
        }
      },
      fetchPolicy: 'network-only',
      subscribeToMore: [
        {
          document: PROGRESS_CHANGED,
          variables () {
            return {
              id: this.progressId
            }
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            return {
              progress: subscriptionData.data.progressChanged
            }
          }
        },
        {
          document: PROGRESS_REMOVED,
          variables () {
            return {
              id: this.progressId
            }
          },
          updateQuery: () => {
            return {
              progress: null
            }
          }
        }
      ]
    }
  },

  computed: {
    loading () {
      return this.progress && !this.progress.error
    },

    statusMessage () {
      if (!this.progress) return null

      const { status } = this.progress
      let message
      if (status) {
        const values = {}
        if (this.progress.args) {
          for (let i = 0, l = this.progress.args.length; i < l; i++) {
            values[`arg${i}`] = this.progress.args[i]
          }
        }
        const key = `org.vue.mixins.progress.${status}`
        message = this.$t(key, values)
        message = (message !== key && message)
        if (!message) {
          message = this.$t(status, values)
          message = (message !== status && message)
        }
      }
      return message || status || ''
    }
  }
}
