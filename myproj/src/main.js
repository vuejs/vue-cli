// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router2 from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router2,
  template: '<App/>',
  components: { App }
})
