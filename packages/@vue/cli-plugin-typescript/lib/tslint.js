module.exports = function lint (args = {}, api, silent) {
  const cwd = api.resolve('.')
  const findUp = require('find-up')
  const fs = require('fs')
  const path = require('path')
  const globby = require('globby')
  const tslint = require('tslint')
  const ts = require('typescript')
  /* eslint-disable-next-line node/no-extraneous-require */
  const vueCompiler = require('vue-template-compiler')
  const isVueFile = file => /\.vue(\.ts)?$/.test(file)

  const options = {
    fix: args['fix'] !== false,
    formatter: args.format || 'codeFrame',
    formattersDirectory: args['formatters-dir'],
    rulesDirectory: args['rules-dir']
  }

  // hack to make tslint --fix work for *.vue files:
  // we save the non-script parts to a cache right before
  // linting the file, and patch fs.writeFileSync to combine the fixed script
  // back with the non-script parts.
  // this works because (luckily) tslint lints synchronously.
  const vueFileCache = new Map()
  const writeFileSync = fs.writeFileSync

  const patchWriteFile = () => {
    fs.writeFileSync = (file, content, options) => {
      if (isVueFile(file)) {
        const parts = vueFileCache.get(path.normalize(file))
        if (parts) {
          const { before, after } = parts
          content = `${before}\n${content.trim()}\n${after}`
        }
      }
      return writeFileSync(file, content, options)
    }
  }

  const restoreWriteFile = () => {
    fs.writeFileSync = writeFileSync
  }

  const parseTSFromVueFile = file => {
    const content = fs.readFileSync(file, 'utf-8')
    const { script } = vueCompiler.parseComponent(content, { pad: 'line' })
    if (script && /^tsx?$/.test(script.lang)) {
      vueFileCache.set(file, {
        before: content.slice(0, script.start),
        after: content.slice(script.end)
      })
      return script.content
    }
  }

  const tsconfigs = globby.sync('**/tsconfig.json', { cwd, ignore: ['node_modules'] })

  const linterResults = tsconfigs.map(tsconfig => {
    const configAbsolutePath = api.resolve(tsconfig)
    const program = tslint.Linter.createProgram(configAbsolutePath)

    // patch getSourceFile for *.vue files
    // so that it returns the <script> block only
    const patchProgram = program => {
      const getSourceFile = program.getSourceFile
      program.getSourceFile = function (file, languageVersion, onError) {
        if (isVueFile(file)) {
          const script = parseTSFromVueFile(file) || ''
          return ts.createSourceFile(file, script, languageVersion, true)
        } else {
          return getSourceFile.call(this, file, languageVersion, onError)
        }
      }
    }

    patchProgram(program)

    const linter = new tslint.Linter(options, program)

    // patch linter.updateProgram to ensure every program has correct getSourceFile
    const updateProgram = linter.updateProgram
    linter.updateProgram = function (...args) {
      updateProgram.call(this, ...args)
      patchProgram(this.program)
    }

    const createVueConfig = config => {
      // create a patched config that disables the blank lines rule,
      // so that we get correct line numbers in error reports for *.vue files.
      const vueConfig = Object.assign(config)
      const rules = vueConfig.rules = new Map(vueConfig.rules)
      const rule = rules.get('no-consecutive-blank-lines')
      rules.set('no-consecutive-blank-lines', Object.assign({}, rule, {
        ruleSeverity: 'off'
      }))

      return vueConfig
    }

    const lint = filePath => {
      const tslintConfig = tslint.Configuration.findConfiguration(findUp.sync('tslint.json', { cwd: path.dirname(filePath) })).results
      const isVue = isVueFile(filePath)
      patchWriteFile()
      linter.lint(
        // append .ts so that tslint apply TS rules
        filePath,
        '',
        // use Vue config to ignore blank lines
        isVue ? createVueConfig(tslintConfig) : tslintConfig
      )
      restoreWriteFile()
    }

    const configDirectory = path.dirname(configAbsolutePath)

    const resolveFiles = () => {
      if (args._ && args._.length) {
        return resolveFilesFromCommandLine()
      } else {
        return resolveFilesFromConfig()
      }
    }

    const resolveFilesFromCommandLine = () => {
      const files = args._

      return globby(files, { cwd: cwd })
    }

    const mergeExtendsConfig = (resolvedTsconfig, configPath, followedPaths = []) => {
      const extendedConfigFileName = resolvedTsconfig.extends

      // if there's a path we've already seen, the config files create a circular dependency
      if (followedPaths.includes(extendedConfigFileName)) {
        throw Error('tsconfig.json "extends" property creates a circular dependency')
      }

      if (extendedConfigFileName) {
        const extendedTsconfigPath = path.resolve(configPath, extendedConfigFileName + '.json')
        const extendedTsconfigDir = path.dirname(extendedTsconfigPath)
        const extendedTsconfig = JSON.parse(fs.readFileSync(extendedTsconfigPath))

        // for our purpose, we only care about the "files", "includes", and "excludes" properties
        return mergeExtendsConfig(
          {
            files: resolvedTsconfig.files || extendedTsconfig.files,
            includes: resolvedTsconfig.includes || extendedTsconfig.includes,
            excludes: resolvedTsconfig.excludes || extendedTsconfig.excludes
          },
          extendedTsconfigDir,
          followedPaths.concat([extendedTsconfigPath])
        )
      } else {
        return resolvedTsconfig
      }
    }

    const resolveFilesFromConfig = () => {
      const tsconfigJson = JSON.parse(fs.readFileSync(configAbsolutePath))
      const fullConfig = mergeExtendsConfig(tsconfigJson, configAbsolutePath)
      let globs = []
      const include = fullConfig.include || []
      // The "files" property in tsconfig.json can be relative or absolute
      const tsconfigFiles = (fullConfig.files || [])
        .map(file => {
          if (file.startsWith('/')) {
            return file
          } else {
            return path.resolve(configDirectory, file)
          }
        })
      const ignore = fullConfig.exclude || [
        'node_modules',
        'bower_components',
        'jspm_packages'
      ]

      if (include.length === 0 && tsconfigFiles.length === 0) {
        globs = [
          '.ts',
          '.tsx',
          '.d.ts'
        ]
      } else {
        globs = include
      }

      return globby(globs, { cwd: configDirectory, ignore }).then(files => {
        return files
          .map(file => path.resolve(configDirectory, file))
          .concat(tsconfigFiles)
      })
    }

    return resolveFiles().then(files => {
      files
        .forEach(lint)

      return linter.getResult()
    })
  })

  return Promise.all(linterResults)
    .then(results => {
      if (silent) return

      const combinedResults = results.reduce((acc, result) => {
        return {
          errorCount: acc.errorCount + result.errorCount,
          failures: acc.failures.concat(result.failures),
          fixes: acc.fixes.concat(result.fixes),
          format: acc.format,
          output: (acc.output + result.output).replace('\n\n', '\n'),
          warningCount: acc.warningCount + result.warningCount
        }
      }, {
        errorCount: 0,
        failures: [],
        fixes: [],
        format: options.formatter,
        output: '\n',
        warningCount: 0
      })

      if (combinedResults.output.trim()) {
        process.stdout.write(combinedResults.output)
      } else if (combinedResults.fixes.length) {
        // some formatters do not report fixes.
        const f = new tslint.Formatters.ProseFormatter()
        process.stdout.write(f.format(combinedResults.failures, combinedResults.fixes))
      } else if (!combinedResults.failures.length) {
        console.log(`No lint errors found.\n`)
      }

      if (combinedResults.failures.length && !args.force) {
        process.exitCode = 1
      }
    })
}
