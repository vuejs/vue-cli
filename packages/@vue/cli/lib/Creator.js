const chalk = require('chalk')
const debug = require('debug')
const execa = require('execa')
const axios = require('axios')
const resolve = require('resolve')
const inquirer = require('inquirer')
const Generator = require('./Generator')
const cloneDeep = require('lodash.clonedeep')
const sortObject = require('./util/sortObject')
const installDeps = require('./util/installDeps')
const clearConsole = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const writeFileTree = require('./util/writeFileTree')
const formatFeatures = require('./util/formatFeatures')
const setupDevProject = require('./util/setupDevProject')

const {
  defaults,
  validate,
  saveOptions,
  loadOptions
} = require('./options')

const {
  log,
  error,
  hasGit,
  hasYarn,
  logWithSpinner,
  stopSpinner
} = require('@vue/cli-shared-utils')

const isMode = _mode => ({ mode }) => _mode === mode

module.exports = class Creator {
  constructor (name, context, promptModules) {
    this.name = name
    this.context = process.env.VUE_CLI_CONTEXT = context
    const { modePrompt, featurePrompt } = this.resolveIntroPrompts()
    this.modePrompt = modePrompt
    this.featurePrompt = featurePrompt
    this.outroPrompts = this.resolveOutroPrompts()
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.createCompleteCbs = []

    const promptAPI = new PromptModuleAPI(this)
    promptModules.forEach(m => m(promptAPI))
  }

  async create (cliOptions = {}) {
    const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG
    const { name, context, createCompleteCbs } = this
    const run = (command, args) => {
      if (!args) { [command, ...args] = command.split(/\s+/) }
      return execa(command, args, { cwd: context })
    }

    let options
    if (cliOptions.saved) {
      options = loadOptions()
    } else if (cliOptions.default) {
      options = defaults
    } else if (cliOptions.config) {
      try {
        options = JSON.parse(cliOptions.config)
      } catch (e) {
        error(`CLI inline config is not valid JSON: ${cliOptions.config}`)
        process.exit(1)
      }
    } else {
      options = await this.promptAndResolveOptions()
    }

    // clone before mutating
    options = cloneDeep(options)
    // inject core service
    options.plugins['@vue/cli-service'] = Object.assign({
      projectName: name
    }, options)

    const packageManager = (
      cliOptions.packageManager ||
      options.packageManager ||
      (hasYarn ? 'yarn' : 'npm')
    )

    clearConsole()
    logWithSpinner(`✨`, `Creating project in ${chalk.yellow(context)}.`)

    // get latest CLI version
    let latestCLIVersion
    if (!isTestOrDebug) {
      const res = await axios.get(`https://registry.npmjs.org/@vue%2Fcli/`)
      latestCLIVersion = res.data['dist-tags'].latest
    } else {
      latestCLIVersion = require('../package.json').version
    }
    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      devDependencies: {}
    }
    const deps = Object.keys(options.plugins)
    deps.forEach(dep => {
      pkg.devDependencies[dep] = `^${latestCLIVersion}`
    })
    // write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })

    // intilaize git repository before installing deps
    // so that vue-cli-service can setup git hooks.
    if (hasGit) {
      logWithSpinner(`🗃`, `Initializing git repository...`)
      await run('git init')
    }

    // install plugins
    stopSpinner()
    log(`⚙  Installing CLI plugins. This might take a while...`)
    log()
    if (isTestOrDebug) {
      // in development, avoid installation process
      await setupDevProject(context)
    } else {
      await installDeps(context, packageManager, cliOptions.registry)
    }

    // run generator
    log()
    log(`🚀  Invoking generators...`)
    const plugins = this.resolvePlugins(options.plugins)
    const generator = new Generator(
      context,
      pkg,
      plugins,
      createCompleteCbs
    )
    await generator.generate()

    // install additional deps (injected by generators)
    log(`📦  Installing additional dependencies...`)
    log()
    if (!isTestOrDebug) {
      await installDeps(context, packageManager, cliOptions.registry)
    }

    // run complete cbs if any (injected by generators)
    log()
    logWithSpinner('⚓', `Running completion hooks...`)
    for (const cb of createCompleteCbs) {
      await cb()
    }

    // commit initial state
    if (hasGit) {
      await run('git add -A')
      if (isTestOrDebug) {
        await run('git', ['config', 'user.name', 'test'])
        await run('git', ['config', 'user.email', 'test@test.com'])
      }
      await run(`git commit -m init`)
    }

    // log instructions
    stopSpinner()
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    log(
      `👉  Get started with the following commands:\n\n` +
      chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`) +
      chalk.cyan(` ${chalk.gray('$')} ${options.packageManager === 'yarn' ? 'yarn serve' : 'npm run serve'}`)
    )
    log()
  }

  async promptAndResolveOptions () {
    // prompt
    clearConsole()
    const answers = await inquirer.prompt(this.resolveFinalPrompts())
    debug('vue:cli-answers')(answers)

    let options
    if (answers.mode === 'saved') {
      options = loadOptions()
    } else if (answers.mode === 'default') {
      options = defaults
    } else {
      // manual
      options = {
        packageManager: answers.packageManager || loadOptions().packageManager,
        plugins: {}
      }
      // run cb registered by prompt modules to finalize the options
      this.promptCompleteCbs.forEach(cb => cb(answers, options))
    }

    // validate
    validate(options)

    // save options
    if (answers.mode === 'manual' && answers.save) {
      saveOptions(options, true /* replace */)
    }

    debug('vue:cli-options')(options)
    return options
  }

  // { id: options } => [{ id, apply, options }]
  resolvePlugins (rawPlugins) {
    // ensure cli-service is invoked first
    rawPlugins = sortObject(rawPlugins, ['@vue/cli-service'])
    return Object.keys(rawPlugins).map(id => {
      const module = resolve.sync(`${id}/generator`, { basedir: this.context })
      return {
        id,
        apply: require(module),
        options: rawPlugins[id]
      }
    })
  }

  resolveIntroPrompts () {
    const defualtFeatures = formatFeatures(defaults)
    const modePrompt = {
      name: 'mode',
      type: 'list',
      message: `Please pick a project creation mode:`,
      choices: [
        {
          name: `Zero-config with defaults (${defualtFeatures})`,
          value: 'default'
        },
        {
          name: 'Manually select features',
          value: 'manual'
        }
      ]
    }
    const savedOptions = loadOptions()
    if (savedOptions.plugins) {
      const savedFeatures = formatFeatures(savedOptions)
      modePrompt.choices.unshift({
        name: `Use previously saved config (${savedFeatures})`,
        value: 'saved'
      })
    }
    const featurePrompt = {
      name: 'features',
      when: isMode('manual'),
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [],
      pageSize: 8
    }
    return {
      modePrompt,
      featurePrompt
    }
  }

  resolveOutroPrompts () {
    const outroPrompts = []
    const savedOptions = loadOptions()
    if (hasYarn && !savedOptions.packageManager) {
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
      message: 'Save the preferences for future projects? (You can always manually edit ~/.vuerc)'
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
