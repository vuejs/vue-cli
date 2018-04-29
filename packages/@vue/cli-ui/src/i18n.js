import Vue from 'vue'
import VueI18n from 'vue-i18n'
import deepmerge from 'deepmerge'

Vue.use(VueI18n)

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const locale = key.match(/([a-z0-9]+)\./i)[1]
    messages[locale] = locales(key)
  })
  return messages
}

function detectLanguage () {
  try {
    const lang = (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      window.navigator.userLanguage
    return lang.substr(0, 2)
  } catch (e) {
    return undefined
  }
}

const i18n = new VueI18n({
  locale: detectLanguage() || 'en',
  fallbackLocale: 'en',
  messages: loadLocaleMessages()
})

export function mergeLocale (lang, messages) {
  const newData = deepmerge(i18n.getLocaleMessage(lang), messages)
  i18n.setLocaleMessage(lang, newData)
}

export default i18n
