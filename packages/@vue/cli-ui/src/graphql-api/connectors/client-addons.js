const channels = require('../channels')

let addons = []

function list (context) {
  return addons
}

function add (options, context) {
  if (findOne(options.id)) return

  addons.push(options)
  context.pubsub.publish(channels.CLIENT_ADDON_ADDED, {
    clientAddonAdded: options
  })
}

function findOne (id, context) {
  return addons.find(
    addon => addon.id === id
  )
}

function remove (id, context) {
  const index = addons.findIndex(
    addon => addon.id === id
  )
  if (index !== -1) addons.splice(index, 1)
}

module.exports = {
  list,
  add,
  remove,
  findOne
}
