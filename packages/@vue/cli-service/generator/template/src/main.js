import Vue from 'vue'
import App from './App.vue'
<%_ if (rootOptions.router) { _%>
import router from './router'
<%_ } _%>
<%_ if (rootOptions.vuex) { _%>
import store from './store'
<%_ } _%>

Vue.config.productionTip = false

new Vue({
  <%_ if (rootOptions.router) { _%>
  router,
  <%_ } _%>
  <%_ if (rootOptions.vuex) { _%>
  store,
  <%_ } _%>
  render: h => h(App)
}).$mount('#app')
