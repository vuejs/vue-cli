// Subscriptions channels
const channels = require('../channels')
// Utils
const { log } = require('../util/logger')
const path = require('path')
const fs = require('fs-extra')
const { rcFolder } = require('../util/rcFolder')
const stats = require('../util/stats')

/**
 * @typedef SharedData
 * @prop {string} id
 * @prop {any} value
 * @prop {Date} updated
 * @prop {boolean} disk
 */

const rootFolder = path.resolve(rcFolder, 'shared-data')
fs.ensureDirSync(rootFolder)

/** @type {Map<string, Map<string, SharedData>>} */
const sharedData = new Map()
const watchers = new Map()

function get ({ id, projectId }, context) {
  const store = sharedData.get(projectId)
  if (!store) return null

  let data = store.get(id)
  if (data == null) {
    if (fs.existsSync(path.resolve(rootFolder, projectId, `${id}.json`))) {
      data = {
        id,
        updated: new Date(),
        disk: true
      }
    }
  }

  if (data && data.disk) {
    data.value = readOnDisk({ id, projectId }, context)
  }

  return data
}

async function readOnDisk ({ id, projectId }, context) {
  const file = path.resolve(rootFolder, projectId, `${id}.json`)
  if (await fs.exists(file)) {
    return fs.readJson(file)
  }
  return null
}

async function set ({ id, projectId, value, disk = false }, context) {
  if (disk) {
    await writeOnDisk({ id, projectId, value }, context)
  }
  let store = sharedData.get(projectId)
  if (!store) {
    store = new Map()
    sharedData.set(projectId, store)
  }
  store.set(id, {
    id,
    ...(disk ? {} : { value }),
    disk,
    updated: new Date()
  })

  const stat = stats.get(`shared-data_${projectId}`, id)
  stat.value = 0
  context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
    sharedDataUpdated: { id, projectId, value }
  })

  const watchers = notify({ id, projectId, value }, context)

  setTimeout(() => log('SharedData set', id, projectId, value, `(${watchers.length} watchers, ${stat.value} subscriptions)`))

  return { id, value }
}

async function writeOnDisk ({ id, projectId, value }, context) {
  const projectFolder = path.resolve(rootFolder, projectId)
  await fs.ensureDir(projectFolder)
  await fs.writeJson(path.resolve(projectFolder, `${id}.json`), value)
}

async function remove ({ id, projectId }, context) {
  const store = sharedData.get(projectId)
  if (store) {
    const data = store.get(id)
    if (data && data.disk) {
      fs.remove(path.resolve(rootFolder, projectId, `${id}.json`))
    }
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
