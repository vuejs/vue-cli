import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'
import WebpackAnalyzer from './components/WebpackAnalyzer.vue'
import TestView from './components/TestView.vue'

Vue.use(VueProgress, {
  defaultShape: 'circle'
})

ClientAddonApi.component('vue-webpack-dashboard', WebpackDashboard)
ClientAddonApi.component('vue-webpack-analyzer', WebpackAnalyzer)

ClientAddonApi.addRoutes('vue-webpack', [
  { path: '', name: 'test-webpack-route', component: TestView }
])
