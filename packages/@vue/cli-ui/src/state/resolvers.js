import LOADING from '@/graphql/loading/loading.gql'

export default {
  Mutation: {
    connectedSet: (root, { value }, { cache }) => {
      const data = {
        connected: value
      }
      cache.writeData({ data })
      return null
    },

    loadingChange: (root, { mod }, { cache }) => {
      const { loading } = cache.readQuery({ query: LOADING })
      const data = {
        loading: loading + mod
      }
      cache.writeData({ data })
      return null
    },

    darkModeSet: (root, { enabled }, { cache }) => {
      const data = {
        darkMode: enabled
      }
      cache.writeData({ data })
      const el = document.getElementsByTagName('html')[0]
      if (enabled) {
        el.classList.add('vue-ui-dark-mode')
      } else {
        el.classList.remove('vue-ui-dark-mode')
      }
      return null
    },

    currentProjectIdSet: (root, { projectId }, { cache }) => {
      const data = {
        currentProjectId: projectId
      }
      cache.writeData({ data })
      return null
    }
  }
}
