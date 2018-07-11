const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()
pubsub.ee.setMaxListeners(0)
module.exports = pubsub
