// Infer rootOptions for individual generators being invoked
// in an existing project.
const { semver, isPlugin } = require('@vue/cli-shared-utils')
module.exports = function inferRootOptions (pkg) {
  const rootOptions = {}
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies)

  // projectName
  rootOptions.projectName = pkg.name

  if ('vue' in deps) {
    const vue2Range = semver.Range('^2.0.0', { includePrerelease: true })
    const vue3Range = semver.Range('^3.0.0-0', { includePrerelease: true })

    const depVueVersion = semver.minVersion(semver.Range(deps.vue))

    if (semver.satisfies(depVueVersion, vue3Range)) {
      rootOptions.vueVersion = '3'
    } else if (semver.satisfies(depVueVersion, vue2Range)) {
      rootOptions.vueVersion = '2'
    }
  }

  // router
  if ('vue-router' in deps) {
    rootOptions.router = true
  }

  // vuex
  if ('vuex' in deps) {
    rootOptions.vuex = true
  }

  // cssPreprocessors
  if ('sass' in deps) {
    rootOptions.cssPreprocessor = 'sass'
  } else if ('node-sass' in deps) {
    rootOptions.cssPreprocessor = 'node-sass'
  } else if ('less-loader' in deps) {
    rootOptions.cssPreprocessor = 'less'
  } else if ('stylus-loader' in deps) {
    rootOptions.cssPreprocessor = 'stylus'
  }

  rootOptions.plugins = Object.keys(deps)
    .filter(isPlugin)
    .reduce((plugins, name) => {
      plugins[name] = {}
      return plugins
    }, {})

  return rootOptions
}
