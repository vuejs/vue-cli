import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { apolloProvider } from './vue-apollo'
import VueUi from '@vue/ui'
import InstantSearch from 'vue-instantsearch'
import * as Filters from './filters'
import './register-components'

Vue.use(VueUi)
Vue.use(InstantSearch)

for (const key in Filters) {
  Vue.filter(key, Filters[key])
}

Vue.config.productionTip = false

const app = new Vue({
  provide: apolloProvider.provide(),
  router,
  i18n,
  ...App
})

async function start () {
  app.$mount('#app')
}

start()
