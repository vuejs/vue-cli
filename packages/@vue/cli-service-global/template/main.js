import Vue from 'vue'
import App from '~entry'

Vue.config.productionTip = false

new Vue({ render: h => h(App) }).$mount('#app')
