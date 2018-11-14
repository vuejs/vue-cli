// Subscriptions channels
const channels = require('../channels')
// Utils
const { log } = require('../util/logger')

const sharedData = new Map()
let watchers = new Map()

function get ({ id, projectId }, context) {
  const store = sharedData.get(projectId)
  if (!store) return null

  const value = store.get(id)
  if (typeof value === 'undefined') return null

  return {
    id,
    value
  }
}

function set ({ id, projectId, value }, context) {
  let store = sharedData.get(projectId)
  if (!store) {
    store = new Map()
    sharedData.set(projectId, store)
  }
  store.set(id, value)

  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, projectId, value }
  })

  const watchers = notify({ id, projectId, value }, context)
  log('SharedData set', id, projectId, value, `(${watchers.length} watchers)`)
  return { id, value }
}

function remove ({ id, projectId }, context) {
  const store = sharedData.get(projectId)
  if (store) {
    store.delete(id)
  }

  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, projectId, value: undefined }
  })

  notify({ id, projectId, value: undefined }, context)
  log('SharedData remove', id, projectId)
}

function watch ({ id, projectId }, handler) {
  let store = watchers.get(projectId)
  if (!store) {
    store = new Map()
    watchers.set(projectId, store)
  }
  let handlers = store.get(id)
  if (!handlers) {
    handlers = []
    store.set(id, handlers)
  }
  handlers.push(handler)
}

function unwatch ({ id, projectId }, handler) {
  const store = watchers.get(projectId)
  if (!store) return

  const handlers = store.get(id)
  if (!handlers) return

  const index = handlers.indexOf(handler)
  if (index !== -1) handlers.splice(index, 1)
}

function unWatchAll ({ projectId }, context) {
  watchers.delete(projectId)
}

function notify ({ id, projectId, value }, context) {
  let handlers = watchers.get(projectId)
  if (handlers) {
    handlers = handlers.get(id)
  }
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
