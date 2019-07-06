module.exports = class PromptModuleAPI {
  constructor () {
    this.features = []
    this.injectedPrompts = []
    this.promptCompleteCbs = []
  }

  injectFeature (feature) {
    this.features.push(feature)
  }

  injectPrompt (prompt) {
    this.injectedPrompts.push(prompt)
  }

  injectOptionForPrompt (name, option) {
    this.injectedPrompts.find(f => {
      return f.name === name
    }).choices.push(option)
  }

  onPromptComplete (cb) {
    this.promptCompleteCbs.push(cb)
  }
}
