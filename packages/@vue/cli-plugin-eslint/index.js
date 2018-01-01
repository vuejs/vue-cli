module.exports = (api, { lintOnSave }) => {
  api.registerCommand('lint', {
    descriptions: 'lint source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--fix': 'auto fix lint errors in-place (default: true)',
      '--format': 'specify formatter (default: codeframe)'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    const { CLIEngine } = require('eslint')

    const files = args._.length ? args._ : ['src', 'test']
    const config = Object.assign({
      cwd: api.resolve('.'),
      fix: true,
      extensions: ['.js', '.vue'],
      parserOptions: {
        parser: require.resolve('babel-eslint')
      },
      rules: {
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
      }
    }, normalizeConfig(args))

    const engine = new CLIEngine(config)
    const report = engine.executeOnFiles(files)
    const formatter = engine.getFormatter(args.format || 'codeframe')

    if (config.fix) {
      CLIEngine.outputFixes(report)
    }

    console.log(formatter(report.results))
  })

  if (lintOnSave) {
    api.chainWebpack(webpackConfig => {
      // TODO eslint-loader
    })
  }
}

function normalizeConfig (args) {
  const config = {}
  for (const key in args) {
    if (key !== '_') {
      config[camelize(key)] = args[key]
    }
  }
  return config
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}
