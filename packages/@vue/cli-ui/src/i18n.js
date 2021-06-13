import Vue from 'vue'
import VueI18n from 'vue-i18n'
import deepmerge from 'deepmerge'
import VueTimeago, { createTimeago } from 'vue-timeago'

Vue.use(VueI18n)

Vue.use(VueTimeago, {
  name: 'VueTimeago',
  locale: 'en'
})

function detectLanguage () {
  try {
    const lang = (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      window.navigator.userLanguage
    return [lang, lang.toLowerCase(), lang.substr(0, 2)].map(lang => lang.replace('-', '_'))
  } catch (e) {
    return undefined
  }
}

async function autoInstallLocale (lang) {
  try {
    const response = await fetch(`https://unpkg.com/vue-cli-locales/locales/${lang}.json`)
    if (response.ok) {
      const data = await response.json()
      mergeLocale(lang, data)
      return true
    }
  } catch (e) {}
  return false
}

async function autoDetect () {
  const codes = detectLanguage()
  if (codes && codes[0].indexOf('en') === -1) {
    let ok = false
    let previousCode
    for (const code of codes) {
      if (code === previousCode) continue
      previousCode = code
      ok = await tryAutoLang(code)
      if (ok) break
    }

    if (!ok) {
      console.log(`[UI] No locale data was found for your locale ${codes[0]}.`)
    }

    let dateFnsLocale = i18n.locale
    if (dateFnsLocale === 'en') {
      dateFnsLocale = 'en-US'
    } else if (dateFnsLocale === 'zh') {
      // we use `zh` as language code in transifex, but date-fns only has zh-CN
      dateFnsLocale = 'zh-CN'
    }

    Vue.component('VueTimeago', createTimeago({
      name: 'VueTimeago',
      locale: i18n.locale,
      locales: {
        [i18n.locale]: require(`date-fns/locale/${dateFnsLocale}/index.js`)
      }
    }))
  }
}

async function tryAutoLang (lang) {
  console.log(`[UI] Trying to load ${lang} locale...`)
  const result = await autoInstallLocale(lang)
  if (result) {
    i18n.locale = lang
    // eslint-disable-next-line no-console
    console.log(`[UI] Automatically loaded ${lang} locale `)
  }
  return result
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
