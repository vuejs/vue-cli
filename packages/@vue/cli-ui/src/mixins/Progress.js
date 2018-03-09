import PROGRESS from '../graphql/progress.gql'
import PROGRESS_CHANGED from '../graphql/progressChanged.gql'

const messages = {
  'creating': 'Creating project...',
  'git-init': 'Initializing git repository...',
  'plugins-install': 'Installing CLI plugins. This might take a while...',
  'invoking-generators': 'Invoking generators...',
  'deps-install': 'Installing additional dependencies...',
  'completion-hooks': 'Running completion hooks...',
  'fetch-remote-preset': `Fetching remote preset...`,
  'done': 'Successfully created project'
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
      subscribeToMore: {
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
      }
    }
  },

  computed: {
    loading () {
      return this.progress && !this.progress.error
    },

    statusMessage () {
      if (!this.progress) return null

      const { status } = this.progress
      const message = messages[status]
      return message || status || ''
    }
  }
}
