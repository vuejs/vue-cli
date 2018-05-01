// Subscriptions channels
const channels = require('../channels')
// Utils
const { log } = require('../utils/logger')

const sharedData = new Map()
let watchers = new Map()

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
  const watchers = notify(id, value)
  log('SharedData set', id, value, `(${watchers.length} watchers)`)
  return { id, value }
}

function remove (id, context) {
  sharedData.delete(id)
  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, value: undefined }
  })
  notify(id, undefined)
  log('SharedData remove', id)
}

function watch (id, handler) {
  let handlers = watchers.get(id)
  if (!handlers) {
    handlers = []
    watchers.set(id, handlers)
  }
  handlers.push(handler)
}

function unwatch (id, handler) {
  const handlers = watchers.get(id)
  if (handlers) {
    const index = handlers.indexOf(handler)
    if (index !== -1) handlers.splice(index, 1)
  }
}

function unWatchAll () {
  watchers = new Map()
}

function notify (id, value) {
  const handlers = watchers.get(id)
  if (handlers) {
    handlers.forEach(fn => fn(value, id))
  }
  return handlers || []
}

module.exports = {
  get,
  set,
  remove,
  watch,
  unwatch,
  unWatchAll
}
