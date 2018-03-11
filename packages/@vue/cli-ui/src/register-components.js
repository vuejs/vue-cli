/**
 * We register all the components so future cli-ui plugins
 * could use them directly
 */

import Vue from 'vue'

// To extract the component name
const nameReg = /([a-z0-9]+)\./i

function registerGlobalComponents (components) {
  components.keys().forEach(key => {
    const name = key.match(nameReg)[1]
    Vue.component(name, {
      name,
      ...components(key).default
    })
  })
}

// Require all the components that start with 'BaseXXX.vue'
let components = require.context('./components', true, /[a-z0-9]+\.(jsx?|vue)$/i)
registerGlobalComponents(components)

// Webpack HMR
if (module.hot) {
  module.hot.accept(components.id, () => {
    try {
      const components = require.context('./components', true, /[a-z0-9]+\.(jsx?|vue)$/i)
      registerGlobalComponents(components)
    } catch (e) {
      location.reload()
    }
  })
}
