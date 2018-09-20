module.exports = api => {
  const { registerWidget, onAction, setSharedData } = api.namespace('org.vue.widgets.')

  if (process.env.VUE_APP_CLI_UI_DEV) {
    api.addClientAddon({
      id: 'org.vue.widgets.client-addon.dev',
      url: 'http://localhost:8097/index.js'
    })
  } else {
    api.addClientAddon({
      id: 'org.vue.widgets.client-addon',
      path: '@vue/cli-ui-addon-widgets/dist'
    })
  }

  // Welcome widget

  registerWidget({
    id: 'welcome',
    title: 'org.vue.widgets.welcome.title',
    description: 'org.vue.widgets.welcome.description',
    component: 'org.vue.widgets.components.welcome',
    minWidth: 3,
    minHeight: 4,
    maxWidth: 3,
    maxHeight: 4,
    maxCount: 1
  })

  // Kill port widget

  registerWidget({
    id: 'kill-port',
    title: 'org.vue.widgets.kill-port.title',
    description: 'org.vue.widgets.kill-port.description',
    component: 'org.vue.widgets.components.kill-port',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 1
  })

  setSharedData('kill-port.status', 'idle')
  onAction('actions.kill-port', async params => {
    const fkill = require('fkill')
    setSharedData('kill-port.status', 'killing')
    try {
      await fkill(`:${params.port}`)
      setSharedData('kill-port.status', 'killed')
    } catch (e) {
      console.log(e)
      setSharedData('kill-port.status', 'error')
    }
  })

  // Plugin updates

  setSharedData('plugin-updates.status', { status: 'no-update' })
  registerWidget({
    id: 'plugin-updates',
    title: 'org.vue.widgets.plugin-updates.title',
    description: 'org.vue.widgets.plugin-updates.description',
    component: 'org.vue.widgets.components.plugin-updates',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 1
  })

  // Depdency updates

  registerWidget({
    id: 'dependency-updates',
    title: 'org.vue.widgets.dependency-updates.title',
    description: 'org.vue.widgets.dependency-updates.description',
    component: 'org.vue.widgets.components.dependency-updates',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 3
  })
}
