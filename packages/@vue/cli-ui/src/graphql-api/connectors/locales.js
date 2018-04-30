const path = require('path')
const fs = require('fs')
const globby = require('globby')
const deepmerge = require('deepmerge')
// Connectors
const cwd = require('./cwd')
// Subs
const channels = require('../channels')
// Context
const getContext = require('../context')
// Utils
const { resolveModule } = require('@vue/cli/lib/util/module')
const { resolveModuleRoot } = require('../utils/resolve-path')

let locales

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
  const modulePath = resolveModule('@vue/cli/bin/vue', cwd.get())
  const folder = resolveModuleRoot(modulePath, '@vue/cli')
  loadFolder(folder, context)
}

function _loadFolder (root, context) {
  const paths = globby.sync([path.join(root, './locales/*.json')])
  paths.forEach(file => {
    const basename = path.basename(file)
    const lang = basename.substr(0, basename.indexOf('.'))
    const strings = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }))
    add({ lang, strings }, context)
  })
}

function loadFolder (root, context) {
  if (process.env.NODE_ENV !== 'production') {
    const watch = require('watch')
    watch.watchTree(root, () => {
      _loadFolder(root, context)
      console.log(`Locales reloaded: ${root}`)
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
