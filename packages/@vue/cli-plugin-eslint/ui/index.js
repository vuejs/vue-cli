const configDescriptor = require('./configDescriptor')
const taskDescriptor = require('./taskDescriptor')

const CONFIG = 'org.vue.eslintrc'
const OPEN_ESLINTRC = 'org.vue.eslint.open-eslintrc'

module.exports = api => {
  api.describeConfig(configDescriptor.config)
  api.describeTask(taskDescriptor.task)

  api.onViewOpen(({ view }) => {
    if (view.id !== 'vue-project-configurations') {
      removeSuggestions()
    }
  })

  api.onConfigRead(({ config }) => {
    if (config.id === CONFIG) {
      api.addSuggestion({
        id: OPEN_ESLINTRC,
        type: 'action',
        label: 'org.vue.eslint.suggestions.open-eslintrc.label',
        handler () {
          const file = config.foundFiles.eslint.path
          const { launch } = require('@vue/cli-shared-utils')
          launch(file)
          return {
            keep: true
          }
        }
      })
    } else {
      removeSuggestions()
    }
  })

  function removeSuggestions () {
    [OPEN_ESLINTRC].forEach(id => api.removeSuggestion(id))
  }
}
