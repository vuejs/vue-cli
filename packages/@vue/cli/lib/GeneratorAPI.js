const { error } = require('./util/log')
const mergeDeps = require('./util/mergeDeps')
const isObject = val => val && typeof val === 'object'
const isFunction = val => typeof val === 'function'

module.exports = class GeneratorAPI {
  constructor (creator, generator) {
    this.creator = creator
    this.generator = generator
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
          this.generator.id
        }": prompt "${name}" does not exist.`
      )
    }
    prompt.choices.push(option)
  }

  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }

  onCreateComplete (msg) {
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
              this.generator.id,
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

  renderFile (file, additionalData, ejsOptions) {
    // TODO render file based on generator path
    // render with ejs & options
    return file
  }
}
