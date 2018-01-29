const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const globby = require('globby')
const isBinary = require('isbinaryfile')
const mergeDeps = require('./util/mergeDeps')

const isString = val => typeof val === 'string'
const isFunction = val => typeof val === 'function'
const isObject = val => val && typeof val === 'object'

module.exports = class GeneratorAPI {
  constructor (id, generator, options, rootOptions) {
    this.id = id
    this.generator = generator
    this.options = options
    this.rootOptions = rootOptions
  }

  injectFileMiddleware (middleware) {
    this.generator.fileMiddlewares.push(middleware)
  }

  extendPackage (fields, options = { merge: true }) {
    const pkg = this.generator.pkg
    const toMerge = isFunction(fields) ? fields(pkg) : fields
    for (const key in toMerge) {
      const value = toMerge[key]
      const existing = pkg[key]
      if (isObject(value) && (key === 'dependencies' || key === 'devDependencies')) {
        // use special version resolution merge
        pkg[key] = mergeDeps(
          this.id,
          existing || {},
          value,
          this.generator.depSources
        )
      } else if (!options.merge || !(key in pkg)) {
        pkg[key] = value
      } else if (Array.isArray(value) && Array.isArray(existing)) {
        pkg[key] = existing.concat(value)
      } else if (isObject(value) && isObject(existing)) {
        pkg[key] = Object.assign({}, existing, value)
      } else {
        pkg[key] = value
      }
    }
  }

  render (fileDir, additionalData = {}, ejsOptions = {}) {
    const baseDir = extractCallDir()
    if (isString(fileDir)) {
      fileDir = path.resolve(baseDir, fileDir)
      this.injectFileMiddleware(async (files) => {
        const data = Object.assign({
          options: this.options,
          rootOptions: this.rootOptions
        }, additionalData)
        const _files = await globby(['**/*'], { cwd: fileDir })
        for (const rawPath of _files) {
          let filename = path.basename(rawPath)
          // dotfiles are ignored when published to npm, therefore in templates
          // we need to use underscore instead (e.g. "_gitignore")
          if (filename.charAt(0) === '_') {
            filename = `.${filename.slice(1)}`
          }
          const targetPath = path.join(path.dirname(rawPath), filename)
          const sourcePath = path.resolve(fileDir, rawPath)
          const content = renderFile(sourcePath, data, ejsOptions)
          // only set file if it's not all whitespace, or is a Buffer (binary files)
          if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
            files[targetPath] = content
          }
        }
      })
    } else if (isObject(fileDir)) {
      this.injectFileMiddleware(files => {
        const data = Object.assign({
          options: this.options,
          rootOptions: this.rootOptions
        }, additionalData)
        for (const targetPath in fileDir) {
          const sourcePath = path.resolve(baseDir, fileDir[targetPath])
          const content = renderFile(sourcePath, data, ejsOptions)
          if (Buffer.isBuffer(content) || content.trim()) {
            files[targetPath] = content
          }
        }
      })
    } else if (isFunction(fileDir)) {
      this.injectFileMiddleware(fileDir)
    }
  }

  postProcessFiles (cb) {
    this.generator.postProcessFilesCbs.push(cb)
  }

  onCreateComplete (cb) {
    this.generator.completeCbs.push(cb)
  }

  resolve (_path) {
    return path.resolve(this.generator.context, _path)
  }

  hasPlugin (id) {
    return this.generator.hasPlugin(id)
  }
}

function extractCallDir () {
  // extract api.render() callsite file location using error stack
  const obj = {}
  Error.captureStackTrace(obj)
  const callSite = obj.stack.split('\n')[3]
  const fileName = callSite.match(/\s\((.*):\d+:\d+\)$/)[1]
  return path.dirname(fileName)
}

function renderFile (name, data, ejsOptions) {
  if (isBinary.sync(name)) {
    return fs.readFileSync(name) // return buffer
  }
  return ejs.render(fs.readFileSync(name, 'utf-8'), data, ejsOptions)
}
