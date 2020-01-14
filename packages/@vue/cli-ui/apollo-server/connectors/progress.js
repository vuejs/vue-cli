// Subs
const channels = require('../channels')

const map = new Map()

function get (id, context) {
  return map.get(id)
}

function set (data, context) {
  const { id } = data
  let progress = get(id, context)
  if (!progress) {
    progress = data
    map.set(id, Object.assign({}, {
      status: null,
      error: null,
      info: null,
      args: null,
      progress: -1
    }, progress))
  } else {
    Object.assign(progress, data)
  }
  context.pubsub.publish(channels.PROGRESS_CHANGED, { progressChanged: progress })
  return progress
}

function remove (id, context) {
  context.pubsub.publish(channels.PROGRESS_REMOVED, { progressRemoved: id })
  return map.delete(id)
}

async function wrap (id, context, operation) {
  set({ id }, context)

  let result
  try {
    result = await operation(data => {
      set(Object.assign({ id }, data), context)
    })
  } catch (error) {
    console.error(error)
    set({ id, error: error.message }, context)
  }

  remove(id, context)

  return result
}

module.exports = {
  get,
  set,
  remove,
  wrap
}
