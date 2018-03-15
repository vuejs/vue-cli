import Vue from 'vue'
import VueI18n from 'vue-i18n'

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

export default i18n
