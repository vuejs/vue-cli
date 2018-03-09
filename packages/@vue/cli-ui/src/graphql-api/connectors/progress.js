const channels = require('../channels')

let map = new Map()

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
      progress: -1
    }, progress))
  } else {
    Object.assign(progress, data)
  }
  context.pubsub.publish(channels.PROGRESS_CHANGED, { progressChanged: progress })
  return progress
}

function remove (id, context) {
  return map.delete(id)
}

async function wrap (id, context, operation) {
  set({ id }, context)

  let result
  let error = null
  try {
    result = await operation(data => {
      set(Object.assign({ id }, data), context)
    })
  } catch (e) {
    error = e
    set({ id, error: error.message }, context)
  }

  remove(id, context)

  if (error) {
    throw error
  }

  return result
}

module.exports = {
  get,
  set,
  remove,
  wrap
}
