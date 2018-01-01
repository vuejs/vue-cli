module.exports = function lint (cwd, args = {}) {
  const { CLIEngine } = require('eslint')
  const { done } = require('@vue/cli-shared-utils')

  const files = args._ && args._.length ? args._ : ['src', 'test']
  if (args['no-fix']) {
    args.fix = false
    delete args['no-fix']
  }
  const config = Object.assign({
    cwd,
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
    if (!args.silent) {
      const hasFixed = report.results.some(f => f.output)
      done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
    }
  } else {
    console.log(formatter(report.results))
    process.exit(1)
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
