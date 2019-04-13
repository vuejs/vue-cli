const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()
pubsub.ee.setMaxListeners(Infinity)
module.exports = pubsub
