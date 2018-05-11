import Vue from 'vue'
import VueI18n from 'vue-i18n'
import deepmerge from 'deepmerge'

Vue.use(VueI18n)

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

async function autoInstallLocale (lang) {
  try {
    let response = await fetch(`https://unpkg.com/vue-cli-locale-${lang}`)
    if (response.ok) {
      // Redirect
      const location = response.headers.get('location')
      if (location) {
        response = await fetch(`https://unpkg.com${location}`)
      }
      const data = await response.json()
      mergeLocale(lang, data)
    }
  } catch (e) {}
}

async function autoDetect () {
  const lang = detectLanguage()
  if (lang !== 'en') {
    await autoInstallLocale(lang)
    i18n.locale = lang
    // eslint-disable-next-line no-console
    console.log(`[UI] Automatically loaded ${lang} locale`)
  }
}

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {}
  },
  silentTranslationWarn: process.env.NODE_ENV !== 'production'
})

autoDetect()

export function mergeLocale (lang, messages) {
  const newData = deepmerge(i18n.getLocaleMessage(lang), messages)
  i18n.setLocaleMessage(lang, newData)
}

export default i18n
