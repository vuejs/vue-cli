const { hasYarn } = require('@vue/cli-shared-utils')

module.exports = {
  packageManager: hasYarn ? 'yarn' : 'npm',
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': { config: 'base' },
    '@vue/cli-plugin-unit-mocha-webpack': { assertionLibrary: 'chai' }
  }
}
