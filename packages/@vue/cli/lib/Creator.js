const fs = require('fs')
const os = require('os')
const path = require('path')
const inquirer = require('inquirer')
const { warn } = require('./util/log')
const { execSync } = require('child_process')
const GeneratorAPI = require('./GeneratorAPI')
const writeFileTree = require('./util/writeFileTree')

const rcPath = path.join(os.homedir(), '.vuerc')
const isMode = _mode => ({ mode }) => _mode === mode

module.exports = class Creator {
  constructor (name, generators) {
    this.name = name
    const { modePrompt, featuresPrompt } = this.resolveIntroPrompts()
    this.modePrompt = modePrompt
    this.featuresPrompt = featuresPrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.deps = {}
    this.devDeps = {}
    this.scripts = {}
    this.packageFields = {}
    this.files = {}
    this.postCreateMessages = []
    this.promptCompleteCbs = []
    this.fileMiddlewares = []

    generators.forEach(({ module }) => {
      module(new GeneratorAPI(this, generator))
    })
  }

  async create (path) {
    // 1. prompt
    let options = await inquirer.prompt(this.resolveFinalPrompts())
    if (options.mode === 'saved') {
      options = this.loadSavedOptions()
    } else if (options.mode === 'default') {
      options = this.loadDefaultOptions()
    } else if (options.save) {
      this.saveOptions(options)
    }
    options.features = options.features || []

    // 2. run cbs (register generators)
    this.promptCompleteCbs.forEach((cb => cb(options))
    // 3. resolve deps, scripts and generate final package.json
    this.resolvePackage()
    // 4. wait for file resolve
    await this.resolveFiles()
    // 5. write file tree to disk
    await writeFileTree(path, this.files)
  }

  resolveIntroPrompts () {
    const modePrompt = {
      name: 'mode',
      type: 'list',
      message: `Pick a project creation mode:`,
      choices: [
        {
          name: 'Zero-configuration with defaults (Babel, ESLint, Unit Tests w/ Mocha)',
          value: 'default'
        },
        {
          name: 'Manually select features (advanced)',
          value: 'manual'
        }
      ]
    }
    if (fs.existsSync(rcPath)) {
      modePrompt.choices.unshift({
        name: 'Using saved preferences',
        value: 'saved',
      })
    }
    const featurePrompt = {
      name: 'features',
      when: isMode('manual'),
      type: 'checkbox',
      message: 'Please check all features needed for your project.',
      choices: []
    }
    return {
      modePrompt,
      featuresPrompt
    }
  }

  resolveOutroPrompts () {
    const outroPrompts = [
      {
        name: 'save',
        when: isMode('manual'),
        type: 'confirm',
        message: 'Save the preferences for future projects?'
      }
    ]
    if (hasYarn()) {
      outroPrompts.push({
        name: 'packageManager',
        when: isMode('manual'),
        type: 'list',
        message: 'Automatically install NPM dependencies after project creation?',
        choices: [
          {
            name: 'Use NPM',
            value: 'npm',
            short: 'NPM'
          },
          {
            name: 'Use Yarn',
            value: 'yarn',
            short: 'Yarn'
          },
          {
            name: `I'll handle that myself`,
            value: false,
            short: 'No'
          }
        ]
      })
    } else {
      outroPrompts.push({
        name: 'packageManager',
        when: isMode('manual'),
        type: 'confirm',
        message: 'Automatically install NPM dependencies after project creation?'
      })
    }
  }

  resolveFinalPrompts () {
    // patch generator-injected prompts to only show when mode === 'manual'
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = options => {
        return options.mode === 'manual' && originalWhen(options)
      }
    })
    return [].concat([
      this.modePrompt,
      this.featuresPrompt,
      this.injectedPrompts,
      this.outroPrompts
    ])
  }

  loadSavedOptions () {
    try {
      return JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
    } catch (e) {
      throw new Error(
        `Error loading saved preferences: ` +
        `~/.vuerc may be corrupted or have syntax errors. ` +
        `You may need to delete it and re-run vue-cli in manual mode.\n` +
        `(${e.message})`
      )
    }
  }

  saveOptions (options) {
    try {
      fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
    } catch (e) {
      warn(
        `Error saving preferences: ` +
        `make sure you have write access to ~/.vuerc.\n` +
        `(${e.message})`
      )
    }
  }

  resolvePackage () {
    const { dependencies, devDependencies } = this.resolveDeps()
    const scripts = this.resolveScripts()
    const additionalFields = this.resolvePackageFields()
    const pkg = Object.assign({}, additionalFields, {
      name: this.name,
      version: '0.1.0',
      private: true,
      scripts,
      dependencies,
      devDependencies
    })
    this.files['package.json'] = JSON.stringify(pkg, null, 2)
  }

  // TODO
  resolveDeps () {
    const dependencies = this.deps
    const devDependencies = this.devDeps
    return {
      dependencies,
      devDependencies
    }
  }

  // TODO
  resolveScripts () {
    return this.scripts
  }

  // TODO
  resolvePackageFields () {
    return this.packageFields
  }

  // TODO
  async resolveFiles () {

  }
}

function hasYarn () {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
