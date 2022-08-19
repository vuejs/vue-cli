const fs = require('fs')
const globby = require('globby')

const renamedArrayArgs = {
  ext: ['extensions'],
  rulesdir: ['rulePaths'],
  plugin: ['overrideConfig', 'plugins'],
  'ignore-pattern': ['overrideConfig', 'ignorePatterns']
}

const renamedObjectArgs = {
  env: { key: ['overrideConfig', 'env'], def: true },
  global: { key: ['overrideConfig', 'globals'], def: false }
}

const renamedArgs = {
  'inline-config': ['allowInlineConfig'],
  rule: ['overrideConfig', 'rules'],
  eslintrc: ['useEslintrc'],
  c: ['overrideConfigFile'],
  config: ['overrideConfigFile'],
  'output-file': ['outputFile']
}

module.exports = async function lint (args = {}, api) {
  const path = require('path')
  const cwd = api.resolve('.')
  const { log, done, exit, chalk, loadModule } = require('@vue/cli-shared-utils')
  const { ESLint } = loadModule('eslint', cwd, true) || require('eslint')
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

  if (!config.overrideConfig) {
    config.overrideConfig = {}
  }

  if (!fs.existsSync(api.resolve('.eslintignore')) && !config.overrideConfig.ignorePatterns) {
    // .eslintrc.js files (ignored by default)
    // However, we need to lint & fix them so as to make the default generated project's
    // code style consistent with user's selected eslint config.
    // Though, if users provided their own `.eslintignore` file, we don't want to
    // add our own customized ignore pattern here (in eslint, ignorePattern is
    // an addition to eslintignore, i.e. it can't be overridden by user),
    // following the principle of least astonishment.
    config.overrideConfig.ignorePatterns = [
      '!.*.js',
      '!{src,tests}/**/.*.js'
    ]
  }
  /** @type {import('eslint').ESLint} */
  const eslint = new ESLint(Object.fromEntries([

    // File enumeration
    'cwd',
    'errorOnUnmatchedPattern',
    'extensions',
    'globInputPaths',
    'ignore',
    'ignorePath',

    // Linting
    'allowInlineConfig',
    'baseConfig',
    'overrideConfig',
    'overrideConfigFile',
    'plugins',
    'reportUnusedDisableDirectives',
    'resolvePluginsRelativeTo',
    'rulePaths',
    'useEslintrc',

    // Autofix
    'fix',
    'fixTypes',

    // Cache-related
    'cache',
    'cacheLocation',
    'cacheStrategy'
  ].map(k => [k, config[k]])))

  const defaultFilesToLint = []

  for (const pattern of [
    'src',
    'tests',
    // root config files
    '*.js',
    '.*.js'
  ]) {
    if ((await Promise.all(globby
      .sync(pattern, { cwd, absolute: true })
      .map(p => eslint.isPathIgnored(p))))
      .some(r => !r)) {
      defaultFilesToLint.push(pattern)
    }
  }

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
  const resultResults = await eslint.lintFiles(files)
  const reportErrorCount = resultResults.reduce((p, c) => p + c.errorCount, 0)
  const reportWarningCount = resultResults.reduce((p, c) => p + c.warningCount, 0)
  process.cwd = processCwd

  const formatter = await eslint.loadFormatter(args.format || 'stylish')

  if (config.outputFile) {
    const outputFilePath = path.resolve(config.outputFile)
    try {
      fs.writeFileSync(outputFilePath, formatter.format(resultResults))
      log(`Lint results saved to ${chalk.blue(outputFilePath)}`)
    } catch (err) {
      log(`Error saving lint results to ${chalk.blue(outputFilePath)}: ${chalk.red(err)}`)
    }
  }

  if (config.fix) {
    await ESLint.outputFixes(resultResults)
  }

  const maxErrors = argsConfig.maxErrors || 0
  const maxWarnings = typeof argsConfig.maxWarnings === 'number' ? argsConfig.maxWarnings : Infinity
  const isErrorsExceeded = reportErrorCount > maxErrors
  const isWarningsExceeded = reportWarningCount > maxWarnings

  if (!isErrorsExceeded && !isWarningsExceeded) {
    if (!args.silent) {
      const hasFixed = resultResults.some(f => f.output)
      if (hasFixed) {
        log(`The following files have been auto-fixed:`)
        log()
        resultResults.forEach(f => {
          if (f.output) {
            log(`  ${chalk.blue(path.relative(cwd, f.filePath))}`)
          }
        })
        log()
      }
      if (reportWarningCount || reportErrorCount) {
        console.log(formatter.format(resultResults))
      } else {
        done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
      }
    }
  } else {
    console.log(formatter.format(resultResults))
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
      applyConfig(renamedArrayArgs[key], args[key].split(','))
    } else if (renamedObjectArgs[key]) {
      const obj = arrayToBoolObject(args[key].split(','), renamedObjectArgs[key].def)
      applyConfig(renamedObjectArgs[key].key, obj)
    } else if (renamedArgs[key]) {
      applyConfig(renamedArgs[key], args[key])
    } else if (key !== '_') {
      config[camelize(key)] = args[key]
    }
  }
  return config

  function applyConfig ([...keyPaths], value) {
    let targetConfig = config
    const lastKey = keyPaths.pop()
    for (const k of keyPaths) {
      targetConfig = targetConfig[k] || (targetConfig[k] = {})
    }
    targetConfig[lastKey] = value
  }

  function arrayToBoolObject (array, defaultBool) {
    const object = {}
    for (const element of array) {
      const [key, value] = element.split(':')
      object[key] = value != null ? value === 'true' : defaultBool
    }
    return object
  }
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}
