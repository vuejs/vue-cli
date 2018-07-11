const renamedArrayArgs = {
  ext: 'extensions',
  env: 'envs',
  global: 'globals',
  rulesdir: 'rulePaths',
  plugin: 'plugins',
  'ignore-pattern': 'ignorePattern'
}

const renamedArgs = {
  'inline-config': 'allowInlineConfig',
  rule: 'rules',
  eslintrc: 'useEslintrc',
  c: 'configFile',
  config: 'configFile'
}

module.exports = function lint (args = {}, api) {
  const path = require('path')
  const cwd = api.resolve('.')
  const { CLIEngine } = require('eslint')
  const { log, done, exit, chalk } = require('@vue/cli-shared-utils')

  const files = args._ && args._.length ? args._ : ['src', 'tests', '*.js']
  const extensions = require('./eslintOptions').extensions(api)
  const argsConfig = normalizeConfig(args)
  const config = Object.assign({
    extensions,
    fix: true,
    cwd
  }, argsConfig)
  const engine = new CLIEngine(config)
  const report = engine.executeOnFiles(files)
  const formatter = engine.getFormatter(args.format || 'codeframe')

  if (config.fix) {
    CLIEngine.outputFixes(report)
  }

  const maxErrors = argsConfig.maxErrors || 0
  const maxWarnings = typeof argsConfig.maxWarnings === 'number' ? argsConfig.maxWarnings : Infinity
  const isErrorsExceeded = report.errorCount > maxErrors
  const isWarningsExceeded = report.warningCount > maxWarnings

  if (!isErrorsExceeded && !isWarningsExceeded) {
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
    if (isErrorsExceeded && typeof argsConfig.maxErrors === 'number') {
      log(`Eslint found too many errors (maximum: ${argsConfig.maxErrors}).`)
    }
    if (isWarningsExceeded) {
      log(`Eslint found too many warnings (maximum: ${argsConfig.maxWarnings}).`)
    }
    exit(1)
  }
}

function normalizeConfig (args) {
  const config = {}
  for (const key in args) {
    if (renamedArrayArgs[key]) {
      config[renamedArrayArgs[key]] = args[key].split(',')
    } else if (renamedArgs[key]) {
      config[renamedArgs[key]] = args[key]
    } else if (key !== '_') {
      config[camelize(key)] = args[key]
    }
  }
  return config
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}
