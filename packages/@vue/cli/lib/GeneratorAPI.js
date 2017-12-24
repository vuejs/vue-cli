const { error } = require('./util/log')

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

  injectDeps (deps) {
    Object.assign(this.creator.deps, deps)
  }

  injectDevDeps(deps) {
    Object.assign(this.creator.devDeps, deps)
  }

  injectScripts (scripts) {
    Object.assign(this.creator.scripts, scripts)
  }

  injectPackageFields (fields) {
    Object.assign(this.creator.packageFields, fields)
  }

  injectFileMiddleware (middleware) {
    this.creator.fileMiddlewares.push(middleware)
  }

  renderFile (file) {
    return file
  }

  onCreateComplete (msg) {
    this.creator.onCreateCompleteCbs.push(cb)
  }
}
