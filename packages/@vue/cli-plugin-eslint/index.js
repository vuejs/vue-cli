const path = require('path')
const eslintWebpackPlugin = require('eslint-webpack-plugin')

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
  if (options.lintOnSave) {
    const extensions = require('./eslintOptions').extensions(api)
    // Use loadModule to allow users to customize their ESLint dependency version.
    const { resolveModule, loadModule } = require('@vue/cli-shared-utils')
    const cwd = api.getCwd()

    const eslintPkg =
      loadModule('eslint/package.json', cwd, true) ||
      loadModule('eslint/package.json', __dirname, true)

    // ESLint doesn't clear the cache when you upgrade ESLint plugins (ESlint do consider config changes)
    // so we have to manually generate a cache identifier that takes lock file into account.
    const { cacheIdentifier, cacheDirectory } = api.genCacheConfig(
      'eslint',
      {
        eslint: eslintPkg.version
      },
      ['package.json']
    )

    api.chainWebpack(webpackConfig => {
      const { lintOnSave } = options
      const treatAllAsWarnings = lintOnSave === true || lintOnSave === 'warning'
      const treatAllAsErrors = lintOnSave === 'error'

      const failOnWarning = treatAllAsErrors
      const failOnError = !treatAllAsWarnings

      /** @type {import('eslint-webpack-plugin').Options & import('eslint').ESLint.Options} */
      const eslintWebpackPluginOptions = {
        // common to both plugin and ESlint
        extensions,
        // ESlint options
        cwd,
        cache: true,
        cacheLocation: path.format({
          dir: cacheDirectory,
          name: process.env.VUE_CLI_TEST
            ? 'cache'
            : cacheIdentifier,
          ext: '.json'
        }),
        // plugin options
        context: cwd,

        failOnWarning,
        failOnError,

        eslintPath: path.dirname(
          resolveModule('eslint/package.json', cwd) ||
            resolveModule('eslint/package.json', __dirname)
        ),
        formatter: 'stylish'
      }
      webpackConfig.plugin('eslint').use(eslintWebpackPlugin, [eslintWebpackPluginOptions])
    })
  }

  api.registerCommand(
    'lint',
    {
      description: 'lint and fix source files',
      usage: 'vue-cli-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: stylish)',
        '--no-fix': 'do not fix errors or warnings',
        '--no-fix-warnings': 'fix errors, but do not fix warnings',
        '--max-errors [limit]':
          'specify number of errors to make build failed (default: 0)',
        '--max-warnings [limit]':
          'specify number of warnings to make build failed (default: Infinity)',
        '--output-file [file_path]':
          'specify file to write report to'
      },
      details:
        'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
    },
    async args => {
      await require('./lint')(args, api)
    }
  )
}
