import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  <%_ if (doesCompile) { _%>
  render: h => h(App),
  <%_ } else { _%>
  render: function (h) { return h(App) },
  <%_ } _%>
}).$mount('#app')
