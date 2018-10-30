import Vue from 'vue'
import router from '../router'
import { mergeLocale } from '../i18n'
import ProjectHome from '@/components/app/ProjectHome.vue'

export default class ClientAddonApi {
  constructor () {
    this.components = new Map()
    this.componentListeners = new Map()
  }

  /**
   * Register a component globally.
   *
   * @param {string} id Component id
   * @param {object} definition Component definition
   */
  component (id, definition) {
    this.components.set(id, definition)
    const componentId = toComponentId(id)
    Vue.component(componentId, definition)
    // eslint-disable-next-line no-console
    console.log(`[ClientAddonApi] Registered ${componentId} component`)
    // Call listeners
    const listeners = this.componentListeners.get(id)
    if (listeners) {
      listeners.forEach(l => l(definition))
      this.componentListeners.delete(id)
    }
  }

  /**
   * Add routes to vue-router under a /addon/<id> parent route.
   * For example, addRoutes('foo', [ { path: '' }, { path: 'bar' } ])
   * will add the /addon/foo/ and the /addon/foo/bar routes to vue-router.
   *
   * @param {string} id Routes pack id (generally the vue-cli plugin id)
   * @param {any} routes vue-router route definitions
   */
  addRoutes (id, routes) {
    router.addRoutes([
      {
        path: `/addon/${id}`,
        component: ProjectHome,
        meta: {
          needProject: true,
          restore: true
        },
        children: routes
      }
    ])
    // eslint-disable-next-line no-console
    console.log(`[ClientAddonApi] Registered new routes under the /addon/${id} route`)
  }

  /**
   * Merge new strings into the specified lang translations (using vue-i18n).
   *
   * @param {string} lang Locale to merge to (ex: 'en', 'fr'...)
   * @param {object} strings A vue-i18n strings object containing the translations
   */
  addLocalization (lang, strings) {
    mergeLocale(lang, strings)
    // eslint-disable-next-line no-console
    console.log(`[ClientAddonApi] Registered new strings for locale ${lang}`)
  }

  /* Internal */

  getComponent (id) {
    return this.components.get(id)
  }

  listenForComponent (id, cb) {
    let listeners = this.componentListeners.get(id)
    if (!listeners) {
      listeners = []
      this.componentListeners.set(id, listeners)
    }
    listeners.push(cb)
  }

  awaitComponent (id) {
    return new Promise((resolve, reject) => {
      const result = this.getComponent(id)
      if (result) {
        resolve(result)
      } else {
        this.listenForComponent(id, resolve)
      }
    })
  }
}

export function toComponentId (id) {
  id = id.replace(/\./g, '-')
  return `client-addon--${id}`
}
