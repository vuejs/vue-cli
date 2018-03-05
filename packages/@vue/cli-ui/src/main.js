import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { apolloProvider } from './vue-apollo'
import VueUi from '@vue/ui'

Vue.use(VueUi)

Vue.config.productionTip = false

const app = new Vue({
  provide: apolloProvider.provide(),
  router,
  render: h => h(App)
})

async function start () {
  app.$mount('#app')
}

start()
