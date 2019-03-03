module.exports = function lint (args = {}, api, silent) {
  const cwd = api.resolve('.')
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
      const parts = vueFileCache.get(path.normalize(file))
      if (!parts) {
        return writeFileSync(file, content, options)
      }

      // update cached content
      parts.content = content

      content = content.slice(parts.paddingOffset)
      // remove one leading and trailing linebreak, if any
      content = content.replace(/^\r?\n/, '').replace(/\r?\n$/, '')

      const { before, after } = parts

      return writeFileSync(file, `${before}\n${content}\n${after}`, options)
    }
  }

  const restoreWriteFile = () => {
    fs.writeFileSync = writeFileSync
  }

  const padContent = (parts) => {
    const lineCount = parts.before.split(/\r?\n/g).length
    const padding = Array(lineCount).join('//\n')

    parts.content = padding + parts.content
    parts.paddingOffset = padding.length
  }

  const parseTSFromVueFile = file => {
    file = path.normalize(file)
    // If the file has already been cached, don't read the file again. Use the cache instead.
    if (vueFileCache.has(file)) {
      return vueFileCache.get(file)
    }

    const fileContent = fs.readFileSync(file, 'utf-8')
    const { start, end, content, lang } = vueCompiler.parseComponent(fileContent).script || {}
    if (!/^tsx?$/.test(lang)) {
      return { content: '', lang: 'js' }
    }

    const parts = {
      before: fileContent.slice(0, start),
      after: fileContent.slice(end),
      content,
      lang,
      paddingOffset: 0
    }
    vueFileCache.set(file, parts)

    // FIXME pad script content
    // this should be done by vueCompiler.parseComponent with options { pad: 'line' },
    // but it does this only if no lang is set, so it does not work for lang="ts".
    // https://github.com/vuejs/vue/blob/dev/src/sfc/parser.js#L119
    // we do it here until upstream dep supports this correctly
    padContent(parts)

    return parts
  }

  const program = tslint.Linter.createProgram(api.resolve('tsconfig.json'))

  // patch getSourceFile for *.vue files
  // so that it returns the <script> block only
  const patchProgram = program => {
    const getSourceFile = program.getSourceFile
    program.getSourceFile = function (file, languageVersion, onError) {
      if (isVueFile(file)) {
        const { content, lang } = parseTSFromVueFile(file)
        const contentLang = ts.ScriptKind[lang.toUpperCase()]
        return ts.createSourceFile(file, content, languageVersion, true, contentLang)
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

  const tslintConfigPath = tslint.Configuration.CONFIG_FILENAMES
    .map(filename => api.resolve(filename))
    .find(file => fs.existsSync(file))

  const config = tslint.Configuration.findConfiguration(tslintConfigPath).results

  const lint = file => {
    const filePath = api.resolve(file)
    patchWriteFile()
    linter.lint(
      // append .ts so that tslint apply TS rules
      filePath,
      '',
      config
    )
    restoreWriteFile()
  }

  const files = args._ && args._.length
    ? args._
    : ['src/**/*.ts', 'src/**/*.vue', 'src/**/*.tsx', 'tests/**/*.ts', 'tests/**/*.tsx']

  // respect linterOptions.exclude from tslint.json
  if (config.linterOptions && config.linterOptions.exclude) {
    // use the raw tslint.json data because config contains absolute paths
    const rawTslintConfig = tslint.Configuration.readConfigurationFile(tslintConfigPath)
    const excludedGlobs = rawTslintConfig.linterOptions.exclude
    excludedGlobs.forEach((g) => files.push('!' + g))
  }

  return globby(files, { cwd }).then(files => {
    files.forEach(lint)
    if (silent) return
    const result = linter.getResult()
    if (result.output.trim()) {
      process.stdout.write(result.output)
    } else if (result.fixes.length) {
      // some formatters do not report fixes.
      const f = new tslint.Formatters.ProseFormatter()
      process.stdout.write(f.format(result.failures, result.fixes))
    } else if (!result.failures.length) {
      console.log(`No lint errors found.\n`)
    }

    if (result.failures.length && !args.force) {
      process.exitCode = 1
    }
  })
}
