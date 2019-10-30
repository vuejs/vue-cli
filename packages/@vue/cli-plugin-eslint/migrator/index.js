module.exports = (api) => {
  // if project is scaffolded by Vue CLI 3.0.x or earlier,
  // the ESLint dependency (ESLint v4) is inside @vue/cli-plugin-eslint;
  // in Vue CLI v4 it should be extracted to the project dependency list.
  if (api.fromVersion('^3')) {
    const pkg = require(api.resolve('package.json'))
    const hasESLint = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ].some(depType =>
      Object.keys(pkg[depType] || {}).includes('eslint')
    )

    if (!hasESLint) {
      api.extendPackage({
        devDependencies: {
          eslint: '^4.19.1'
        }
      })
    }

    // TODO: add a prompt for users to optionally upgrade their eslint configs to a new major version
  }
}
