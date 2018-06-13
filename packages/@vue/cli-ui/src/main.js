import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { apolloProvider } from './vue-apollo'
import VueUi from '@vue/ui'
import InstantSearch from 'vue-instantsearch'
import VueMeta from 'vue-meta'
import PortalVue from 'portal-vue'
import * as Filters from './filters'
import './register-components'
import ClientAddonApi from './util/ClientAddonApi'
import Responsive from './util/responsive'
import SharedData from './util/shared-data'
import PluginAction from './util/plugin-action'
import gql from 'graphql-tag'
import ClientState from './mixins/ClientState'

window.gql = gql

Vue.use(InstantSearch)
Vue.use(VueMeta)
Vue.use(Responsive, {
  computed: {
    mobile () {
      return this.width <= 768
    },
    tablet () {
      return this.width <= 900
    },
    desktop () {
      return !this.tablet
    },
    wide () {
      return this.width >= 1300
    }
  }
})
Vue.use(VueUi)
Vue.use(PortalVue)
Vue.use(SharedData)
Vue.use(PluginAction)

for (const key in Filters) {
  Vue.filter(key, Filters[key])
}

Vue.mixin(ClientState)

Vue.config.productionTip = false

// For client addons
window.Vue = Vue
window.ClientAddonApi = new ClientAddonApi()

const app = new Vue({
  provide: apolloProvider.provide(),
  router,
  i18n,
  ...App
})

async function start () {
  app.$mount('#app')

  // Restore last route
  const lastRoute = localStorage.getItem('vue-cli-ui.lastRoute')
  if (lastRoute) {
    router.push(lastRoute)
  }
}

start()
