// Subs
const channels = require('../channels')

let locales = []

function list (context) {
  return locales
}

function add ({ lang, strings }, context) {
  const locale = { lang, strings }
  locales.push(locale)
  context.pubsub.publish(channels.LOCALE_ADDED, {
    localeAdded: locale
  })
}

function clear (context) {
  locales = []
}

module.exports = {
  list,
  add,
  clear
}
