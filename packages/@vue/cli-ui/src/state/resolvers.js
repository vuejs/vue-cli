import LOADING from '../graphql/loading.gql'

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
      return null
    }
  }
}
