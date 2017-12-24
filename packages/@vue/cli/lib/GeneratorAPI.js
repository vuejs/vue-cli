module.exports = class GeneratorAPI {
  constructor (creator, generator) {
    this.creator = creator
    this.generator = generator
  }

  injectFeature (feature) {
    this.creator.featurePrompt.choices.push(feature)
  }

  injectOptionForFeature (featureName, option) {
    const feature = this.creator.featurePrompt.choices.find(f => {
      return f.name === featureName
    })
    if (!feature) {
      throw new Error(
        `injectOptionForFeature error in generator "${
          this.generator.id
        }": feature "${featureName}" does not exist.`
      )
    }
    feature.choices.push(option)
  }

  injectPrompt (prompt) {
    this.creator.injectedPrompts.push(prompt)
  }

  onPromptComplete (cb) {
    this.creator.promptCompleteCbs.push(cb)
  }

  injectDeps (deps) {

  }

  injectScripts (scripts) {

  }

  injectPackageFields (fields) {

  }

  injectFilesMiddleware (middleware) {
    this.creator.fileMiddlewares.push(middleware)
  }

  renderFile (file) {

  }

  onCreateComplete (msg) {
    this.creator.onCreateCompleteCbs.push(cb)
  }
}
