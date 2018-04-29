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

// Locales
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
