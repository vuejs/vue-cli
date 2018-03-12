import PROGRESS from '../graphql/progress.gql'
import PROGRESS_CHANGED from '../graphql/progressChanged.gql'
import PROGRESS_REMOVED from '../graphql/progressRemoved.gql'

const messages = {
  'creating': 'Creating project...',
  'git-init': 'Initializing git repository...',
  'plugins-install': 'Installing CLI plugins. This might take a while...',
  'invoking-generators': 'Invoking generators...',
  'deps-install': 'Installing additional dependencies...',
  'completion-hooks': 'Running completion hooks...',
  'fetch-remote-preset': `Fetching remote preset...`,
  'done': 'Successfully created project',
  'plugin-install': 'Installing {{arg0}}',
  'plugin-uninstall': 'Uninstalling {{arg0}}',
  'plugin-invoke': 'Invoking {{arg0}}'
}

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
      let message = messages[status]
      if (message && this.progress.args) {
        for (let i = 0, l = this.progress.args.length; i < l; i++) {
          message = message.replace(
            new RegExp(`{{arg${i}}}`, 'g'),
            this.progress.args[i]
          )
        }
      }
      return message || status || ''
    }
  }
}
