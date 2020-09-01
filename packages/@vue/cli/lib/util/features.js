const { chalk, toShortPluginId } = require('@vue/cli-shared-utils')

exports.getFeatures = (preset) => {
  const features = []
  if (preset.router) {
    features.push('router')
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
  return features
}

exports.formatFeatures = (preset) => {
  const versionInfo = chalk.yellow(`[Vue ${preset.vueVersion || 2}] `)
  const features = exports.getFeatures(preset)

  return versionInfo + features.map(dep => {
    dep = toShortPluginId(dep)
    return chalk.yellow(dep)
  }).join(', ')
}
