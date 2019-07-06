// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

const {
  lintOn,
  eslintConfig
} = require('@vue/cli-shared-utils/lib/pluginPrompts/eslint')

module.exports = [
  eslintConfig,
  lintOn
]
