// Subscriptions channels
const channels = require('../channels')

let sharedData = new Map()

function get (id, context) {
  const value = sharedData.get(id)

  if (typeof value === 'undefined') return null

  return {
    id,
    value
  }
}

function set ({ id, value }, context) {
  sharedData.set(id, value)
  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, value }
  })
  return { id, value }
}

function remove (id, context) {
  sharedData.delete(id)
  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, value: undefined }
  })
}

module.exports = {
  get,
  set,
  remove
}
