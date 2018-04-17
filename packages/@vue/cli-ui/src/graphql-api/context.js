const { db } = require('./utils/db')
const pubsub = require('./pubsub')

// Context passed to all resolvers (third argument)
// eslint-disable-next-line no-unused-vars
module.exports = req => {
  return {
    db,
    pubsub
  }
}
