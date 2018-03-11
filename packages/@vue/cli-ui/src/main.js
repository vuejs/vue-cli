import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { apolloProvider } from './vue-apollo'
import VueUi from '@vue/ui'
import * as Filters from './filters'
import './register-components'

Vue.use(VueUi)

for (const key in Filters) {
  Vue.filter(key, Filters[key])
}

Vue.config.productionTip = false

const app = new Vue({
  provide: apolloProvider.provide(),
  router,
  ...App
})

async function start () {
  app.$mount('#app')
}

start()
