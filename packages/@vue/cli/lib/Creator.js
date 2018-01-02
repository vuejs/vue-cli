const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const debug = require('debug')
const inquirer = require('inquirer')
const Generator = require('./Generator')
const installDeps = require('./util/installDeps')
const clearConsole = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const writeFileTree = require('./util/writeFileTree')
const formatFeatures = require('./util/formatfeatures')
const updatePackageForDev = require('./util/updatePackageForDev')
const exec = require('util').promisify(require('child_process').exec)

const {
  defaults,
  saveOptions,
  loadSavedOptions
} = require('./options')

const {
  log,
  hasGit,
  hasYarn,
  logWithSpinner,
  stopSpinner
} = require('@vue/cli-shared-utils')

const isMode = _mode => ({ mode }) => _mode === mode

module.exports = class Creator {
  constructor (name, targetDir) {
    this.name = name
    this.context = targetDir
    const { modePrompt, featurePrompt } = this.resolveIntroPrompts()
    this.modePrompt = modePrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.createCompleteCbs = []

    const promptAPI = new PromptModuleAPI(this)
    const promptModules = fs
      .readdirSync(path.resolve(__dirname, './promptModules'))
      .filter(file => file.charAt(0) !== '.')
      .map(file => require(`./promptModules/${file}`))

    promptModules.forEach(m => m(promptAPI))
  }

  async create () {
    const name = this.name
    const targetDir = process.env.VUE_CLI_CONTEXT = this.context

    // prompt
    clearConsole()
    const answers = await inquirer.prompt(this.resolveFinalPrompts())
    debug('vue:cli-answers')(answers)

    let options
    if (answers.mode === 'saved') {
      options = this.savedOptions // this is loaded when resolving prompts
    } else if (answers.mode === 'default') {
      options = defaults
    } else {
      // manual
      options = {
        useTaobaoRegistry: null,
        packageManager: answers.packageManager,
        plugins: {}
      }
      // run cb registered by prompt modules to finalize the options
      this.promptCompleteCbs.forEach(cb => cb(answers, options))
    }

    // save options
    if (answers.mode === 'manual' && answers.save) {
      saveOptions(options)
    }

    // inject core service
    options.plugins['@vue/cli-service'] = {
      projectName: name
    }

    debug('vue:cli-ptions')(options)

    // write base package.json to disk
    clearConsole()
    logWithSpinner('✨', `Creating project in ${chalk.yellow(targetDir)}.`)
    writeFileTree(targetDir, {
      'package.json': JSON.stringify({
        name,
        version: '0.1.0',
        private: true
      }, null, 2)
    })

    // intilaize git repository
    if (hasGit) {
      logWithSpinner('🗃', `Initializing git repository...`)
      await exec('git init', { cwd: targetDir })
    }

    // install plugins
    logWithSpinner('⚙', `Installing CLI plugins. This might take a while...`)
    const deps = Object.keys(options.plugins)
    if (process.env.VUE_CLI_DEBUG) {
      // in development, use linked packages
      updatePackageForDev(targetDir, deps)
      await installDeps(targetDir, options)
    } else {
      await installDeps(targetDir, options, deps)
    }

    // run generator
    logWithSpinner('🚀', `Invoking generators...`)
    const generator = new Generator(targetDir, options, this)
    await generator.generate()

    // install additional deps (injected by generators)
    logWithSpinner('📦', `Installing additional dependencies...`)
    await installDeps(targetDir, options)

    // run complete cbs if any
    for (const cb of this.createCompleteCbs) {
      await cb()
    }

    // commit initial state
    if (hasGit) {
      await exec('git add -A', { cwd: targetDir })
      await exec('git commit -m init', { cwd: targetDir })
    }

    // log instructions
    stopSpinner()
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    log(
      `👉  Get started with the following commands:\n\n` +
      chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`) +
      chalk.cyan(` ${chalk.gray('$')} ${options.packageManager === 'yarn' ? 'yarn dev' : 'npm run dev'}`)
    )
    log()
  }

  resolveIntroPrompts () {
    const defualtFeatures = formatFeatures(defaults.plugins)
    const modePrompt = {
      name: 'mode',
      type: 'list',
      message: `Please pick a project creation mode:`,
      choices: [
        {
          name: `Zero-configuration with defaults (${defualtFeatures})`,
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: 'manual'
        }
      ]
    }
    const savedOptions = loadSavedOptions()
    if (savedOptions.plugins) {
      this.savedOptions = savedOptions
      const savedFeatures = formatFeatures(savedOptions.plugins)
      modePrompt.choices.unshift({
        name: `Use previously saved preferences (${savedFeatures})`,
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
    debug('vue:cli-prompts')(prompts)
    return prompts
  }
}
