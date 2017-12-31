const chalk = require('chalk')

module.exports = function formatFeatures (plugins, lead, joiner) {
  return Object.keys(plugins)
    .filter(dep => dep !== '@vue/cli-service')
    .map(dep => {
      dep = dep.replace(/^(@vue\/|vue-)cli-plugin-/, '')
      return `${lead || ''}${chalk.yellow(dep)}`
    })
    .join(joiner || ', ')
}
