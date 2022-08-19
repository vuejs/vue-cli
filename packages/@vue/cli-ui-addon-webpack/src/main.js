import VueProgress from 'vue-progress-path'
import WebpackDashboard from './components/WebpackDashboard.vue'
import WebpackAnalyzer from './components/WebpackAnalyzer.vue'
import TestView from './components/TestView.vue'

Vue.use(VueProgress, {
  defaultShape: 'circle'
})

/* eslint-disable vue/multi-word-component-names */
ClientAddonApi.component('org.vue.webpack.components.dashboard', WebpackDashboard)
ClientAddonApi.component('org.vue.webpack.components.analyzer', WebpackAnalyzer)

ClientAddonApi.addRoutes('org.vue.webpack', [
  { path: '', name: 'org.vue.webpack.routes.test', component: TestView }
])

// Locales
const locales = require.context('./locales', true, /[a-z0-9]+\.json$/i)
locales.keys().forEach(key => {
  const locale = key.match(/([a-z0-9]+)\./i)[1]
  ClientAddonApi.addLocalization(locale, locales(key))
})
