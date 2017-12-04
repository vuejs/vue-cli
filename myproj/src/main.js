// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App2 from './App2'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

Vue.use(Vuetify, {
  theme: {
    primary: '#1bbc9b',
    secondary: '#69707a',
    accent: '#f5d76e',
    error: '#d24d57'
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  template: '<App2/>',  // this App2 is the same as next line App2
  components: { App2 }
})
