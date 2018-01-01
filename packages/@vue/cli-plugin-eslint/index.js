module.exports = (api, { lintOnSave }) => {
  if (lintOnSave) {
    api.chainWebpack(webpackConfig => {
      // TODO eslint-loader
    })
  }

  api.registerCommand('lint', {
    descriptions: 'lint source files',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors'
    },
    details: 'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options'
  }, args => {
    const { CLIEngine } = require('eslint')
    const { done } = require('@vue/cli-shared-utils')

    const files = args._.length ? args._ : ['src', 'test']
    if (args['no-fix']) {
      args.fix = false
      delete args['no-fix']
    }
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

    if (!report.errorCount && !report.warningCount) {
      const hasFixed = report.results.some(f => f.output)
      done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
    } else {
      console.log(formatter(report.results))
    }
  })
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
