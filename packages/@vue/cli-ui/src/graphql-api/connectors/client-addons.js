const path = require('path')
// Subs
const channels = require('../channels')

let addons = []

let baseUrl = process.env.VUE_APP_GRAPHQL_ENDPOINT
if (typeof baseUrl === 'undefined') baseUrl = 'http://localhost:4000'

function list (context) {
  return addons
}

function add (options, context) {
  if (findOne(options.id)) remove(options.id, context)

  addons.push(options)
  context.pubsub.publish(channels.CLIENT_ADDON_ADDED, {
    clientAddonAdded: options
  })
}

function findOne (id, context = null) {
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

function getUrl (addon, context) {
  return addon.url || `${baseUrl}/_addon/${addon.id}/index.js`
}

function getBasePath (filePath) {
  const index = filePath.lastIndexOf('/index.js')
  if (index !== -1) {
    return filePath.substr(0, index)
  }
  return filePath
}

function serve (req, res) {
  const { id, 0: file } = req.params
  const addon = findOne(id)
  if (addon) {
    const basePath = getBasePath(require.resolve(addon.path))
    res.sendFile(path.join(basePath, file))
  } else {
    res.status(404)
    res.send(`Addon ${id} not found in loaded addons. Try opening a vue-cli project first?`)
  }
}

module.exports = {
  list,
  add,
  remove,
  findOne,
  getUrl,
  serve
}
