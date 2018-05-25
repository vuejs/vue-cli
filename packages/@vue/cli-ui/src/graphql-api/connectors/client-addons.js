const path = require('path')
// Subs
const channels = require('../channels')
// Utils
const { resolveModuleRoot } = require('../utils/resolve-path')

let addons = []

let baseUrl = process.env.VUE_APP_CLI_UI_URL
if (typeof baseUrl === 'undefined') {
  baseUrl = 'http://localhost:4000'
} else {
  baseUrl = baseUrl.replace(/ws:\/\/([a-z0-9_-]+:\d+).*/i, 'http://$1')
}

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

function serve (req, res) {
  const { id, 0: file } = req.params
  const addon = findOne(id)
  if (addon && addon.path) {
    const basePath = resolveModuleRoot(require.resolve(addon.path))
    if (basePath) {
      res.sendFile(path.join(basePath, file))
      return
    }
  }

  res.status(404)
  res.send(`Addon ${id} not found in loaded addons. Try opening a vue-cli project first?`)
}

module.exports = {
  list,
  add,
  remove,
  findOne,
  getUrl,
  serve
}
