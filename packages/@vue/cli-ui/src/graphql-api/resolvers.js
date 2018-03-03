const shortid = require('shortid')

module.exports = {
  Counter: {
    countStr: counter => `Current count: ${counter.count}`
  },

  Query: {
    hello: (root, { name }) => `Hello ${name || 'World'}!`,
    messages: (root, args, { db }) => db.get('messages').value(),
    uploads: (root, args, { db }) => db.get('uploads').value()
  },

  Mutation: {
    messageAdd: (root, { input }, { pubsub, db }) => {
      const message = {
        id: shortid.generate(),
        text: input.text
      }

      db
        .get('messages')
        .push(message)
        .last()
        .write()

      pubsub.publish('messages', { messageAdded: message })

      return message
    },

    singleUpload: (root, { file }, { processUpload }) => processUpload(file),
    multipleUpload: (root, { files }, { processUpload }) => Promise.all(files.map(processUpload))
  },

  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).substring(2, 15) // random channel name
        let count = 0
        setInterval(() => pubsub.publish(
          channel,
          {
            // eslint-disable-next-line no-plusplus
            counter: { count: count++ }
          }
        ), 2000)
        return pubsub.asyncIterator(channel)
      }
    },

    messageAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('messages')
    }
  }
}
