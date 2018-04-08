import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'

Vue.use(VueProgress, {
  defaultShape: 'circle'
})

ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)
