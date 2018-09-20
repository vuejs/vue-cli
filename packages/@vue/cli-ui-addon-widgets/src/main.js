import Welcome from './components/Welcome.vue'
import KillPort from './components/KillPort.vue'
import PluginUpdates from './components/PluginUpdates.vue'
import DependencyUpdates from './components/DependencyUpdates.vue'

ClientAddonApi.component('org.vue.widgets.components.welcome', Welcome)
ClientAddonApi.component('org.vue.widgets.components.kill-port', KillPort)
ClientAddonApi.component('org.vue.widgets.components.plugin-updates', PluginUpdates)
ClientAddonApi.component('org.vue.widgets.components.dependency-updates', DependencyUpdates)
