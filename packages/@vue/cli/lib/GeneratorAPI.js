const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const walk = require('klaw-sync')
const { error } = require('./util/log')
const isBinary = require('isbinaryfile')
const mergeDeps = require('./util/mergeDeps')
const errorParser = require('error-stack-parser')

const isString = val => typeof val === 'string'
const isFunction = val => typeof val === 'function'
const isObject = val => val && typeof val === 'object'

module.exports = class GeneratorAPI {
  constructor (id, creator) {
    this.id = id
    this.creator = creator
  }

  injectFeature (feature) {
    this.creator.featurePrompt.choices.push(feature)
  }

  injectPrompt (prompt) {
    this.creator.injectedPrompts.push(prompt)
  }

  injectOptionForPrompt (name, option) {
    const prompt = this.creator.injectedPrompts.find(f => {
      return f.name === name
    })
    if (!prompt) {
      error(
        `injectOptionForFeature error in generator "${
          this.id
        }": prompt "${name}" does not exist.`
      )
    }
    prompt.choices.push(option)
  }

  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }

  onCreateComplete (cb) {
    this.creator.onCreateCompleteCbs.push(cb)
  }

  injectFileMiddleware (middleware) {
    this.creator.fileMiddlewares.push(middleware)
  }

  extendPackage (fields, options = { merge: true }) {
    const pkg = this.creator.pkg
    const toMerge = isFunction(fields) ? fields(pkg) : fields
    for (const key in toMerge) {
      if (!options.merge || !(key in pkg)) {
        pkg[key] = toMerge[key]
      } else {
        const value = toMerge[key]
        const existing = pkg[key]
        if (Array.isArray(value) && Array.isArray(existing)) {
          pkg[key] = existing.concat(value)
        } else if (isObject(value) && isObject(existing)) {
          if (key === 'dependencies' || key === 'devDependencies') {
            // use special version resolution merge
            pkg[key] = mergeDeps(
              this.id,
              existing,
              value,
              this.creator.depSources
            )
          } else {
            pkg[key] = Object.assign({}, existing, value)
          }
        } else {
          pkg[key] = value
        }
      }
    }
  }

  renderFiles (fileDir, additionalData = {}, ejsOptions = {}) {
    const baseDir = extractCallDir()
    if (isString(fileDir)) {
      fileDir = path.resolve(baseDir, fileDir)
      this.injectFileMiddleware(files => {
        const data = Object.assign({
          options: this.creator.options
        }, additionalData)
        const _files = walk(fileDir, {
          nodir: true,
          filter: file => path.basename(file.path) !== '.DS_Store'
        })
        for (const file of _files) {
          const relativePath = path.relative(fileDir, file.path)
          files[relativePath] = renderFile(file.path, data, ejsOptions)
        }
      })
    } else if (isObject(fileDir)) {
      this.injectFileMiddleware(files => {
        const data = Object.assign({
          options: this.creator.options
        }, additionalData)
        for (const targetPath in fileDir) {
          const sourcePath = path.resolve(baseDir, fileDir[targetPath])
          files[targetPath] = renderFile(sourcePath, data, ejsOptions)
        }
      })
    } else if (isFunction(fileDir)) {
      this.injectFileMiddleware(fileDir)
    }
  }
}

function extractCallDir () {
  // extract api.renderFiles() callsite file location using error stack
  const obj = {}
  Error.captureStackTrace(obj)
  const stack = errorParser.parse(obj)
  return path.dirname(stack[2].fileName)
}

function renderFile (name, data, ejsOptions) {
  if (isBinary.sync(name)) {
    return fs.readFileSync(name) // return buffer
  }
  return ejs.render(fs.readFileSync(name, 'utf-8'), data, ejsOptions)
}
