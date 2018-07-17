// Infer rootOptions for individual generators being invoked
// in an existing project.

module.exports = function inferRootOptions (pkg) {
  const rootOptions = {}
  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies)

  // projectName
  rootOptions.projectName = pkg.name

  // router
  if ('vue-router' in deps) {
    rootOptions.router = true
  }

  // vuex
  if ('vuex' in deps) {
    rootOptions.vuex = true
  }

  // cssPreprocessors
  if ('sass-loader' in deps) {
    rootOptions.cssPreprocessor = 'sass'
  } else if ('less-loader' in deps) {
    rootOptions.cssPreprocessor = 'less'
  } else if ('stylus-loader' in deps) {
    rootOptions.cssPreprocessor = 'stylus'
  }

  return rootOptions
}
