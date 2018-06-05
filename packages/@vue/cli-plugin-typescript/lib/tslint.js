module.exports = function lint (args = {}, api, silent) {
  const cwd = api.resolve('.')
  const fs = require('fs')
  const path = require('path')
  const globby = require('globby')
  const tslint = require('tslint')
  /* eslint-disable-next-line node/no-extraneous-require */
  const vueCompiler = require('vue-template-compiler')

  const options = {
    fix: args['fix'] !== false,
    formatter: args.format || 'codeFrame',
    formattersDirectory: args['formatters-dir'],
    rulesDirectory: args['rules-dir']
  }
  const linter = new tslint.Linter(options)

  const config = tslint.Configuration.findConfiguration(api.resolve('tslint.json')).results
  // create a patched config that disables the blank lines rule,
  // so that we get correct line numbers in error reports for *.vue files.
  const vueConfig = Object.assign(config)
  const rules = vueConfig.rules = new Map(vueConfig.rules)
  const rule = rules.get('no-consecutive-blank-lines')
  rules.set('no-consecutive-blank-lines', Object.assign({}, rule, {
    ruleSeverity: 'off'
  }))

  // hack to make tslint --fix work for *.vue files
  // this works because (luckily) tslint lints synchronously
  const vueFileCache = new Map()
  const writeFileSync = fs.writeFileSync
  const patchWriteFile = () => {
    fs.writeFileSync = (file, content, options) => {
      if (/\.vue(\.ts)?$/.test(file)) {
        file = file.replace(/\.ts$/, '')
        const { before, after } = vueFileCache.get(path.normalize(file))
        content = `${before}\n${content.trim()}\n${after}`
      }
      return writeFileSync(file, content, options)
    }
  }
  const restoreWriteFile = () => {
    fs.writeFileSync = writeFileSync
  }

  const lint = file => new Promise((resolve, reject) => {
    const filePath = api.resolve(file)
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) return reject(err)
      const isVue = /\.vue(\.ts)?$/.test(file)
      if (isVue) {
        const { script } = vueCompiler.parseComponent(content, { pad: 'line' })
        if (script) {
          vueFileCache.set(filePath, {
            before: content.slice(0, script.start),
            after: content.slice(script.end)
          })
        }
        content = script && script.content
      }
      if (content) {
        patchWriteFile()
        linter.lint(
          // append .ts so that tslint apply TS rules
          `${filePath}${isVue ? `.ts` : ``}`,
          content,
          // use Vue config to ignore blank lines
          isVue ? vueConfig : config
        )
        restoreWriteFile()
      }
      resolve()
    })
  })

  const files = args._ && args._.length
    ? args._
    : ['src/**/*.ts', 'src/**/*.vue', 'src/**/*.tsx', 'tests/**/*.ts', 'tests/**/*.tsx']

  const stripTsExtension = str => str.replace(/\.vue\.ts\b/g, '.vue')

  return globby(files, { cwd }).then(files => {
    return Promise.all(files.map(lint))
  }).then(() => {
    if (silent) return

    const result = linter.getResult()
    if (result.output.trim()) {
      process.stdout.write(stripTsExtension(result.output))
    } else if (result.fixes.length) {
      // some formatters do not report fixes.
      const f = new tslint.Formatters.ProseFormatter()
      process.stdout.write(stripTsExtension(f.format(result.failures, result.fixes)))
    } else if (!result.failures.length) {
      console.log(`No lint errors found.\n`)
    }

    if (result.failures.length && !args.force) {
      process.exitCode = 1
    }
  })
}
