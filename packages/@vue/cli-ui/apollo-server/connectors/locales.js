const path = require('path')
const fs = require('fs-extra')
const globby = require('globby')
const deepmerge = require('deepmerge')
// Subs
const channels = require('../channels')
// Context
const getContext = require('../context')
// Utils
const { log } = require('../util/logger')

let locales
const watchedTrees = new Map()

function list (context) {
  return locales
}

function add (locale, context) {
  const existing = locales.find(l => l.lang === locale.lang)
  if (existing) {
    existing.strings = deepmerge(existing.strings, locale.strings)
  } else {
    locales.push(locale)
  }
  context.pubsub.publish(channels.LOCALE_ADDED, {
    localeAdded: locale
  })
}

function reset (context) {
  locales = []
  // Load builtin locales
  const folder = path.resolve(__dirname, '../../')
  loadFolder(folder, context)
}

function _loadFolder (root, context) {
  const paths = globby.sync([path.join(root, './locales/*.json')])
  paths.forEach(file => {
    const basename = path.basename(file)
    const lang = basename.substr(0, basename.indexOf('.'))
    const strings = fs.readJsonSync(file)
    add({ lang, strings }, context)
  })
}

function loadFolder (root, context) {
  const folder = path.join(root, './locales')
  if (process.env.VUE_APP_CLI_UI_DEV && !watchedTrees.get(root) && fs.existsSync(folder)) {
    watchedTrees.set(root, true)
    const watch = require('watch')
    watch.watchTree(folder, () => {
      _loadFolder(root, context)
      log('Locales reloaded', root)
    })
  } else {
    _loadFolder(root, context)
  }
}

reset(getContext())

module.exports = {
  list,
  add,
  reset,
  loadFolder
}
