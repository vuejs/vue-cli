const path = require('path')

module.exports = (api, options) => {
  if (options.lintOnSave) {
    const extensions = require('./eslintOptions').extensions(api)
    // Use loadModule to allow users to customize their ESLint dependency version.
    const { loadModule } = require('@vue/cli-shared-utils')
    const cwd = api.getCwd()
    const eslintPkg =
      loadModule('eslint/package.json', cwd, true) ||
      require('eslint/package.json')

    // eslint-loader doesn't bust cache when eslint config changes
    // so we have to manually generate a cache identifier that takes the config
    // into account.
    const { cacheIdentifier } = api.genCacheConfig(
      'eslint-loader',
      {
        'eslint-loader': require('eslint-loader/package.json').version,
        'eslint': eslintPkg.version
      },
      [
        '.eslintrc.js',
        '.eslintrc.yaml',
        '.eslintrc.yml',
        '.eslintrc.json',
        '.eslintrc',
        'package.json'
      ]
    )

    api.chainWebpack(webpackConfig => {
      webpackConfig.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))

      webpackConfig.module
        .rule('eslint')
          .pre()
          .exclude
            .add(/node_modules/)
            .add(require('path').dirname(require.resolve('@vue/cli-service')))
            .end()
          .test(/\.(vue|(j|t)sx?)$/)
          .use('eslint-loader')
            .loader('eslint-loader')
            .options({
              extensions,
              cache: true,
              cacheIdentifier,
              emitWarning: options.lintOnSave !== 'error',
              emitError: options.lintOnSave === 'error',
              formatter:
                loadModule('eslint/lib/formatters/codeframe', cwd, true) ||
                require('eslint/lib/formatters/codeframe')
            })
    })
  }

  api.registerCommand('lint', {
    description: 'lint and fix source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format [formatter]': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors',
      '--max-errors [limit]': 'specify number of errors to make build failed (default: 0)',
      '--max-warnings [limit]': 'specify number of warnings to make build failed (default: Infinity)'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    require('./lint')(args, api)
  })
}
