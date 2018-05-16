module.exports = function lint (args = {}, api) {
  const path = require('path')
  const chalk = require('chalk')
  const cwd = api.resolve('.')
  const { CLIEngine } = require('eslint')
  const options = require('./eslintOptions')(api)
  const { log, done } = require('@vue/cli-shared-utils')

  const files = args._ && args._.length ? args._ : ['src', 'tests', '*.js']
  const argsConfig = normalizeConfig(args)
  const config = Object.assign({}, options, {
    fix: true,
    cwd
  }, argsConfig)
  const engine = new CLIEngine(config)
  const report = engine.executeOnFiles(files)
  const formatter = engine.getFormatter(args.format || 'codeframe')

  if (config.fix) {
    CLIEngine.outputFixes(report)
  }

  const isErrorsExceed = report.errorCount > (argsConfig.maxErrors || 0)
  const isWarningsExceed = report.warningCount > (
    argsConfig.hasOwnProperty('maxWarnings') ? argsConfig.maxWarnings : Infinity)
  if (!isErrorsExceed && !isWarningsExceed) {
    if (!args.silent) {
      const hasFixed = report.results.some(f => f.output)
      if (hasFixed) {
        log(`The following files have been auto-fixed:`)
        log()
        report.results.forEach(f => {
          if (f.output) {
            log(`  ${chalk.blue(path.relative(cwd, f.filePath))}`)
          }
        })
        log()
      }
      if (report.warningCount || report.errorCount) {
        console.log(formatter(report.results))
      } else {
        done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
      }
    }
  } else {
    console.log(formatter(report.results))
    if (isErrorsExceed && typeof argsConfig.maxErrors === 'number') {
      log(`Eslint found too many errors (maximum: ${argsConfig.maxErrors}).`)
    }
    if (isWarningsExceed) {
      log(`Eslint found too many warnings (maximum: ${argsConfig.maxWarnings}).`)
    }
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
