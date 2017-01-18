/* eslint-disable */
import Vue from 'vue'
// your-tasteful-component is an alias to the path of your component
// for example: vue build component.vue
// then `your-tasteful-component` is `component.vue`
import App from 'your-tasteful-component'

new Vue({
  el: '#app',
  render: h => h(App)
})
