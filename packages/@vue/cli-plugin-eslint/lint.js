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
  const chalk = require('chalk')
  const cwd = api.resolve('.')
  const { CLIEngine } = require('eslint')
  const options = require('./eslintOptions')(api)
  const { log, done } = require('@vue/cli-shared-utils')

  const files = args._ && args._.length ? args._ : ['src', 'tests', '*.js']
  const config = Object.assign({}, options, {
    fix: true,
    cwd
  }, normalizeConfig(args))
  const engine = new CLIEngine(config)
  const report = engine.executeOnFiles(files)
  const formatter = engine.getFormatter(args.format || 'codeframe')

  if (config.fix) {
    CLIEngine.outputFixes(report)
  }

  if (!report.errorCount) {
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
      if (report.warningCount) {
        console.log(formatter(report.results))
      } else {
        done(hasFixed ? `All lint errors auto-fixed.` : `No lint errors found!`)
      }
    }
  } else {
    console.log(formatter(report.results))
    process.exit(1)
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
