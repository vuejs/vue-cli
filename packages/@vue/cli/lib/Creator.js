const fs = require('fs')
const os = require('os')
const path = require('path')
const chalk = require('chalk')
const debug = require('debug')
const emoji = require('node-emoji')
const inquirer = require('inquirer')
const Generator = require('./Generator')
const installDeps = require('./util/installDeps')
const PromptModuleAPI = require('./PromptModuleAPI')
const writeFileTree = require('./util/writeFileTree')
const { logWithSpinner, stopSpinner } = require('./util/spinner')

const {
  error,
  hasYarn,
  clearConsole
} = require('@vue/cli-shared-utils')

const rcPath = path.join(os.homedir(), '.vuerc')
const isMode = _mode => ({ mode }) => _mode === mode

const defaultOptions = {
  packageManager: hasYarn ? 'yarn' : 'npm',
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': { config: 'eslint-only' },
    '@vue/cli-plugin-unit-mocha-webpack': { assertionLibrary: 'chai' }
  }
}

module.exports = class Creator {
  constructor (modules) {
    const { modePrompt, featurePrompt } = this.resolveIntroPrompts()
    this.modePrompt = modePrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []

    const api = new PromptModuleAPI(this)
    modules.forEach(m => m(api))
  }

  async create (name, targetDir) {
    // prompt
    clearConsole()
    const answers = await inquirer.prompt(this.resolveFinalPrompts())
    debug('answers')(answers)

    let options
    if (answers.mode === 'saved') {
      options = this.loadSavedOptions()
    } else if (answers.mode === 'default') {
      options = defaultOptions
    } else {
      // manual
      options = {
        packageManager: answers.packageManager,
        plugins: {}
      }
      // run cb registered by prompt modules to finalize the options
      this.promptCompleteCbs.forEach(cb => cb(answers, options))
    }

    // save options
    if (answers.mode === 'manual' && answers.save) {
      this.saveOptions(options)
    }

    // inject core service
    options.plugins['@vue/cli-service'] = {
      projectName: name
    }

    debug('options')(options)

    // write base package.json to disk
    clearConsole()
    logWithSpinner(emoji.get('sparkles'), `Creating project in ${chalk.yellow(targetDir)}.`)
    writeFileTree(targetDir, {
      'package.json': JSON.stringify({
        name,
        version: '0.1.0',
        private: true
      }, null, 2)
    })

    // install deps
    logWithSpinner(emoji.get('electric_plug'), `Installing CLI plugins. This might take a while...`)
    const deps = Object.keys(options.plugins)
    if (process.env.VUE_CLI_DEBUG) {
      // in development, use linked packages
      updatePackageForDev(targetDir, deps)
      await installDeps(options.packageManager, targetDir)
    } else {
      await installDeps(options.packageManager, targetDir, deps)
    }

    logWithSpinner(emoji.get('gear'), `Invoking generators...`)
    // run generator
    const generator = new Generator(targetDir, options)
    await generator.generate()

    // install deps again (new deps injected by generators)
    logWithSpinner(emoji.get('package'), `Installing additional dependencies...`)
    await installDeps(options.packageManager, targetDir)
    stopSpinner()
    console.log(`${chalk.green('✔')}  Successfully created project ${chalk.yellow(name)}.`)
    console.log()
    console.log(
      `${emoji.get('point_right')}  Get started with the following commands:\n\n` +
      chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`) +
      chalk.cyan(` ${chalk.gray('$')} ${options.packageManager === 'yarn' ? 'yarn dev' : 'npm run dev'}`)
    )
    console.log()
  }

  resolveIntroPrompts () {
    const modePrompt = {
      name: 'mode',
      type: 'list',
      message: `Please pick a project creation mode:`,
      choices: [
        {
          name: 'Zero-configuration with defaults',
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: 'manual'
        }
      ]
    }
    if (fs.existsSync(rcPath)) {
      modePrompt.choices.unshift({
        name: 'Use previously saved preferences',
        value: 'saved'
      })
    }
    const featurePrompt = {
      name: 'features',
      when: isMode('manual'),
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: []
    }
    return {
      modePrompt,
      featurePrompt
    }
  }

  resolveOutroPrompts () {
    const outroPrompts = []
    if (hasYarn) {
      outroPrompts.push({
        name: 'packageManager',
        when: isMode('manual'),
        type: 'list',
        message: 'Pick the package manager to use when installing dependencies:',
        choices: [
          {
            name: 'Use Yarn',
            value: 'yarn',
            short: 'Yarn'
          },
          {
            name: 'Use NPM',
            value: 'npm',
            short: 'NPM'
          }
        ]
      })
    }
    outroPrompts.push({
      name: 'save',
      when: isMode('manual'),
      type: 'confirm',
      message: 'Save the preferences for future projects?'
    })
    return outroPrompts
  }

  resolveFinalPrompts () {
    // patch generator-injected prompts to only show when mode === 'manual'
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = options => {
        return options.mode === 'manual' && originalWhen(options)
      }
    })
    const prompts = [].concat(
      this.modePrompt,
      this.featurePrompt,
      this.injectedPrompts,
      this.outroPrompts
    )
    debug('prompts')(prompts)
    return prompts
  }

  loadSavedOptions () {
    try {
      return JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
        `~/.vuerc may be corrupted or have syntax errors. ` +
        `You may need to delete it and re-run vue-cli in manual mode.\n` +
        `(${e.message})`,
      )
      process.exit(1)
    }
  }

  saveOptions (options) {
    options = Object.assign({}, options)
    delete options.projectName
    delete options.mode
    delete options.save
    try {
      fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
    } catch (e) {
      error(
        `Error saving preferences: ` +
        `make sure you have write access to ~/.vuerc.\n` +
        `(${e.message})`
      )
    }
  }
}

function updatePackageForDev (targetDir, deps) {
  const pkg = require(path.resolve(targetDir, 'package.json'))
  pkg.devDependencies = {}
  deps.forEach(dep => {
    pkg.devDependencies[dep] = require(path.resolve(
      __dirname,
      '../../../',
      dep,
      'package.json'
    )).version
  })
  fs.writeFileSync(
    path.resolve(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2)
  )
}
