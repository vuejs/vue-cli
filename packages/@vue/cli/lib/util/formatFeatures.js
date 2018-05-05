const chalk = require('chalk')
const { toShortPluginId } = require('@vue/cli-shared-utils')

module.exports = function formatFeatures (preset, lead, joiner) {
  const features = []
  if (preset.router) {
    features.push('vue-router')
  }
  if (preset.vuex) {
    features.push('vuex')
  }
  if (preset.cssPreprocessor) {
    features.push(preset.cssPreprocessor)
  }
  const plugins = Object.keys(preset.plugins).filter(dep => {
    return dep !== '@vue/cli-service'
  })
  features.push.apply(features, plugins)
  return features.map(dep => {
    dep = toShortPluginId(dep)
    return `${lead || ''}${chalk.yellow(dep)}`
  }).join(joiner || ', ')
}
