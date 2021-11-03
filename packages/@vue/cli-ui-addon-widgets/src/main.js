import Welcome from './components/Welcome.vue'
import KillPort from './components/KillPort.vue'
import PluginUpdates from './components/PluginUpdates.vue'
import DependencyUpdates from './components/DependencyUpdates.vue'
import Vulnerability from './components/Vulnerability.vue'
import VulnerabilityDetails from './components/VulnerabilityDetails.vue'
import RunTask from './components/RunTask.vue'
import News from './components/News.vue'

/* eslint-disable vue/multi-word-component-names */
ClientAddonApi.component('org.vue.widgets.components.welcome', Welcome)
ClientAddonApi.component('org.vue.widgets.components.kill-port', KillPort)
ClientAddonApi.component('org.vue.widgets.components.plugin-updates', PluginUpdates)
ClientAddonApi.component('org.vue.widgets.components.dependency-updates', DependencyUpdates)
ClientAddonApi.component('org.vue.widgets.components.vulnerability', Vulnerability)
ClientAddonApi.component('org.vue.widgets.components.vulnerability-details', VulnerabilityDetails)
ClientAddonApi.component('org.vue.widgets.components.run-task', RunTask)
ClientAddonApi.component('org.vue.widgets.components.news', News)
