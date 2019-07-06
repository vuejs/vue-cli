// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

const {
  historyMode
} = require('@vue/cli-shared-utils/lib/pluginPrompts/router')

module.exports = [
  historyMode
]
