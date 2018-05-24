module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    const extensions = require('./eslintOptions').extensions(api)
    const cacheIdentifier = genCacheIdentifier(api.resolve('.'))

    api.chainWebpack(webpackConfig => {
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
              emitWarning: lintOnSave !== 'error',
              formatter: require('eslint/lib/formatters/codeframe')
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

// eslint-loader doesn't bust cache when eslint config changes
// so we have to manually generate a cache identifier that takes the config
// into account.
function genCacheIdentifier (context) {
  const fs = require('fs')
  const path = require('path')
  const files = [
    '.eslintrc.js',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc.json',
    '.eslintrc',
    'package.json'
  ]

  const configTimeStamp = (() => {
    for (const file of files) {
      if (fs.existsSync(path.join(context, file))) {
        return fs.statSync(file).mtimeMs
      }
    }
  })()

  return JSON.stringify({
    'eslint-loader': require('eslint-loader/package.json').version,
    'eslint': require('eslint/package.json').version,
    'config': configTimeStamp
  })
}
