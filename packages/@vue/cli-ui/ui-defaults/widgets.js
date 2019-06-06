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
    icon: 'mood',
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
    icon: 'flash_on',
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

  setSharedData('plugin-updates.status', {
    status: 'ok',
    lastUpdate: Date.now()
  })
  registerWidget({
    id: 'plugin-updates',
    title: 'org.vue.widgets.plugin-updates.title',
    description: 'org.vue.widgets.plugin-updates.description',
    icon: 'extension',
    component: 'org.vue.widgets.components.plugin-updates',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 1
  })

  // Depdency updates

  setSharedData('dependency-updates.status', {
    status: 'loading',
    lastUpdate: null
  })
  registerWidget({
    id: 'dependency-updates',
    title: 'org.vue.widgets.dependency-updates.title',
    description: 'org.vue.widgets.dependency-updates.description',
    icon: 'collections_bookmark',
    component: 'org.vue.widgets.components.dependency-updates',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 1
  })

  // Vulnerability check

  let lastAudit = null
  setSharedData('vulnerability.status', {
    status: 'loading',
    lastUpdate: lastAudit,
    count: 0,
    message: null
  })
  setSharedData('vulnerability.details', {
    vulnerabilities: [],
    summary: {}
  })
  registerWidget({
    id: 'vulnerability',
    title: 'org.vue.widgets.vulnerability.title',
    description: 'org.vue.widgets.vulnerability.description',
    icon: 'verified_user',
    component: 'org.vue.widgets.components.vulnerability',
    detailsComponent: 'org.vue.widgets.components.vulnerability-details',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    maxCount: 1
  })
  async function checkVulnerability (params) {
    setSharedData('vulnerability.status', {
      status: 'loading',
      lastUpdate: lastAudit,
      count: 0,
      message: null
    })

    const { auditProject } = require('./utils/audit')
    const { status, details } = await auditProject(api.getCwd())

    status.lastUpdate = lastAudit = Date.now()

    setSharedData('vulnerability.status', status)
    setSharedData('vulnerability.details', details)
  }
  onAction('actions.check-vunerability', checkVulnerability)
  checkVulnerability()

  // Run task

  registerWidget({
    id: 'run-task',
    title: 'org.vue.widgets.run-task.title',
    description: 'org.vue.widgets.run-task.description',
    icon: 'assignment',
    component: 'org.vue.widgets.components.run-task',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 1,
    needsUserConfig: true,
    onConfigOpen: async ({ context }) => {
      const tasks = require('@vue/cli-ui/apollo-server/connectors/tasks')
      return {
        prompts: [
          {
            name: 'task',
            type: 'list',
            message: 'org.vue.widgets.run-task.prompts.task',
            choices: (await tasks.list(undefined, context)).map(task => ({
              name: task.name,
              value: task.id
            }))
          }
        ]
      }
    }
  })

  // News

  registerWidget({
    id: 'news',
    title: 'org.vue.widgets.news.title',
    description: 'org.vue.widgets.news.description',
    icon: 'rss_feed',
    component: 'org.vue.widgets.components.news',
    detailsComponent: 'org.vue.widgets.components.news',
    minWidth: 2,
    minHeight: 1,
    maxWidth: 6,
    maxHeight: 6,
    defaultWidth: 2,
    defaultHeight: 3,
    openDetailsButton: true,
    defaultConfig: () => ({
      url: 'https://vuenews.fireside.fm/rss'
    }),
    onConfigOpen: async ({ context }) => {
      return {
        prompts: [
          {
            name: 'url',
            type: 'input',
            message: 'org.vue.widgets.news.prompts.url',
            validate: input => !!input
          }
        ]
      }
    }
  })

  const newsCache = global['org.vue.newsCache'] = global['org.vue.newsCache'] || {}
  let parser

  onAction('actions.fetch-news', async params => {
    if (!parser) {
      const Parser = require('rss-parser')
      parser = new Parser()
    }

    if (!params.force) {
      const cached = newsCache[params.url]
      if (cached) return cached
    }

    let url = params.url
    // GitHub repo
    if (url.match(/^[\w_.-]+\/[\w_.-]+$/)) {
      url = `https://github.com/${url}/releases.atom`
    }

    const result = await parser.parseURL(url)
    newsCache[params.url] = result
    return result
  })
}
