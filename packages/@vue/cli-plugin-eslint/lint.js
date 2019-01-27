const fs = require('fs')
const globby = require('globby')

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
  const { log, done, exit, chalk, loadModule } = require('@vue/cli-shared-utils')
  const { CLIEngine } = loadModule('eslint', cwd, true) || require('eslint')
  const extensions = require('./eslintOptions').extensions(api)

  const argsConfig = normalizeConfig(args)
  const config = Object.assign({
    extensions,
    fix: true,
    cwd
  }, argsConfig)

  const noFixWarnings = (argsConfig.fixWarnings === false)
  const noFixWarningsPredicate = (lintResult) => lintResult.severity === 2
  config.fix = config.fix && (noFixWarnings ? noFixWarningsPredicate : true)

  if (!fs.existsSync(api.resolve('.eslintignore'))) {
    // .eslintrc.js files (ignored by default)
    // However, we need to lint & fix them so as to make the default generated project's
    // code style consistent with user's selected eslint config.
    // Though, if users provided their own `.eslintignore` file, we don't want to
    // add our own customized ignore pattern here (in eslint, ignorePattern is
    // an addition to eslintignore, i.e. it can't be overriden by user),
    // following the principle of least astonishment.
    config.ignorePattern = [
      '!.*.js',
      '!{src,tests}/**/.*.js'
    ]
  }

  const engine = new CLIEngine(config)

  const defaultFilesToLint = [
    'src',
    'tests',
    // root config files
    '*.js',
    '.*.js'
  ]
    .filter(pattern =>
      globby
        .sync(path.join(cwd, pattern))
        .some(p => !engine.isPathIgnored(p))
    )

  const files = args._ && args._.length
    ? args._
    : defaultFilesToLint

  // mock process.cwd before executing
  // See:
  // https://github.com/vuejs/vue-cli/issues/2554
  // https://github.com/benmosher/eslint-plugin-import/issues/602
  // https://github.com/eslint/eslint/issues/11218
  const processCwd = process.cwd
  if (!api.invoking) {
    process.cwd = () => cwd
  }
  const report = engine.executeOnFiles(files)
  process.cwd = processCwd

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
