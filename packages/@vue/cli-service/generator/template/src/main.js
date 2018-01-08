import Vue from 'vue'
import App from './App.vue'
<%_ if (options.router) { _%>
import router from './router'
<%_ } _%>
<%_ if (options.vuex) { _%>
import store from './store'
<%_ } _%>

Vue.config.productionTip = false

new Vue({
  <%_ if (options.router) { _%>
  router,
  <%_ } _%>
  <%_ if (options.vuex) { _%>
  store,
  <%_ } _%>
  render: h => h(App)
}).$mount('#app')
