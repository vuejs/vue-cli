export default {
  Mutation: {
    connectedSet: (root, { value }, { cache }) => {
      const data = {
        connected: value
      }
      cache.writeData({ data })
    }
  }
}
