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

exports.formatFeatures = (name, preset) => {
  let versionInfo = ''
  if (preset.vueVersion) {
    versionInfo = chalk.yellow(`[Vue ${preset.vueVersion}] `)
  } else if (name === 'default') {  // default preset is Vue version-agnositic
    versionInfo = chalk.yellow('[Vue 2 & 3] ')
  } else {
    versionInfo = chalk.yellow('[Vue 2] ')
  }

  const features = exports.getFeatures(preset)
  return versionInfo + features.map(dep => {
    dep = toShortPluginId(dep)
    return chalk.yellow(dep)
  }).join(', ')
}
