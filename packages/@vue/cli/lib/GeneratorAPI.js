const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const walk = require('klaw-sync')
const isBinary = require('isbinaryfile')
const mergeDeps = require('./util/mergeDeps')
const errorParser = require('error-stack-parser')

const isString = val => typeof val === 'string'
const isFunction = val => typeof val === 'function'
const isObject = val => val && typeof val === 'object'

module.exports = class GeneratorAPI {
  constructor (id, generator, options) {
    this.id = id
    this.generator = generator
    this.options = options
  }

  injectFileMiddleware (middleware) {
    this.generator.fileMiddlewares.push(middleware)
  }

  extendPackage (fields, options = { merge: true }) {
    const pkg = this.generator.pkg
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
              this.generator.depSources
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

  render (fileDir, additionalData = {}, ejsOptions = {}) {
    const baseDir = extractCallDir()
    if (isString(fileDir)) {
      fileDir = path.resolve(baseDir, fileDir)
      this.injectFileMiddleware(files => {
        const data = Object.assign({
          options: this.options
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
          options: this.options
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

  onCreateComplete (cb) {
    this.generator.creator.createCompleteCbs.push(cb)
  }
}

function extractCallDir () {
  // extract api.render() callsite file location using error stack
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
