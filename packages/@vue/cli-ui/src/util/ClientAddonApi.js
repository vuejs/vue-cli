import Vue from 'vue'
import router from '../router'
import ProjectHome from '../views/ProjectHome.vue'

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
    console.log(`Registered ${componentId} component`)
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
  return `client-addon--${id}`
}
