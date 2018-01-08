const chalk = require('chalk')

module.exports = function formatFeatures (options, lead, joiner) {
  const features = []
  if (options.router) {
    features.push('vue-router')
  }
  if (options.vuex) {
    features.push('vuex')
  }
  const plugins = Object.keys(options.plugins).filter(dep => {
    return dep !== '@vue/cli-service'
  })
  features.push.apply(features, plugins)
  return features.map(dep => {
    dep = dep.replace(/^(@vue\/|vue-)cli-plugin-/, '')
    return `${lead || ''}${chalk.yellow(dep)}`
  }).join(joiner || ', ')
}
