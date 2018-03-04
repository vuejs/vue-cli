const fs = require('fs')
const path = require('path')
const debug = require('debug')
const chalk = require('chalk')
const readPkg = require('read-pkg')
const merge = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const loadEnv = require('./util/loadEnv')
const defaultsDeep = require('lodash.defaultsdeep')
const { warn, error, isPlugin } = require('@vue/cli-shared-utils')

const { defaults, validate } = require('./options')

module.exports = class Service {
  constructor (context, { plugins, pkg, projectOptions, useBuiltIn } = {}) {
    process.VUE_CLI_SERVICE = this
    this.context = context
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    this.pkg = this.resolvePkg(pkg)

    // load base .env
    this.loadEnv()

    const userOptions = this.loadUserOptions(projectOptions)
    this.projectOptions = defaultsDeep(userOptions, defaults())

    debug('vue:project-config')(this.projectOptions)

    // install plugins.
    // If there are inline plugins, they will be used instead of those
    // found in package.json.
    // When useBuiltIn === false, built-in plugins are disabled. This is mostly
    // for testing.
    this.plugins = this.resolvePlugins(plugins, useBuiltIn)
    this.plugins.forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // apply webpack configs from project config file
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }

  resolvePkg (inlinePkg) {
    if (inlinePkg) {
      return inlinePkg
    } else if (fs.existsSync(path.join(this.context, 'package.json'))) {
      return readPkg.sync(this.context)
    } else {
      return {}
    }
  }

  loadEnv (mode) {
    const logger = debug('vue:env')
    const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = path => {
      try {
        const res = loadEnv(path)
        logger(path, res)
      } catch (err) {
        // only ignore error if file is not found
        if (err.toString().indexOf('ENOENT') < 0) {
          error(err)
        }
      }
    }

    load(basePath)
    load(localPath)
  }

  resolvePlugins (inlinePlugins, useBuiltIn) {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    const builtInPlugins = [
      './commands/serve',
      './commands/build',
      './commands/inspect',
      './commands/help',
      // config plugins are order sensitive
      './config/base',
      './config/css',
      './config/dev',
      './config/prod',
      './config/app'
    ].map(idToPlugin)

    if (inlinePlugins) {
      return useBuiltIn !== false
        ? builtInPlugins.concat(inlinePlugins)
        : inlinePlugins
    } else {
      const projectPlugins = Object.keys(this.pkg.dependencies || {})
        .concat(Object.keys(this.pkg.devDependencies || {}))
        .filter(isPlugin)
        .map(idToPlugin)
      return builtInPlugins.concat(projectPlugins)
    }
  }

  run (name, args = {}, rawArgv = []) {
    args._ = args._ || []
    let command = this.commands[name]
    if (!command && name) {
      error(`command "${name}" does not exist.`)
      process.exit(1)
    }
    if (!command || args.help) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
      rawArgv.shift()
    }
    const { fn } = command
    return Promise.resolve(fn(args, rawArgv))
  }

  resolveChainableWebpackConfig () {
    const chainableConfig = new Config()
    // apply chains
    this.webpackChainFns.forEach(fn => fn(chainableConfig))
    return chainableConfig
  }

  resolveWebpackConfig (chainableConfig = this.resolveChainableWebpackConfig()) {
    // get raw config
    let config = chainableConfig.toConfig()
    // apply raw config fns
    this.webpackRawConfigFns.forEach(fn => {
      if (typeof fn === 'function') {
        // function with optional return value
        const res = fn(config)
        if (res) config = merge(config, res)
      } else if (fn) {
        // merge literal values
        config = merge(config, fn)
      }
    })
    return config
  }

  loadUserOptions (inlineOptions) {
    // vue.config.js
    let fileConfig, pkgConfig, resolved, resovledFrom
    const configPath = (
      process.env.VUE_CLI_SERVICE_CONFIG_PATH ||
      path.resolve(this.context, 'vue.config.js')
    )
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)
        if (!fileConfig || typeof fileConfig !== 'object') {
          error(
            `Error loading ${chalk.bold('vue.config.js')}: should export an object.`
          )
          fileConfig = null
        }
      } catch (e) {
        error(`Error loading ${chalk.bold('vue.config.js')}:`)
        throw e
      }
    }

    // package.vue
    pkgConfig = this.pkg.vue
    if (pkgConfig && typeof pkgConfig !== 'object') {
      error(
        `Error loading vue-cli config in ${chalk.bold(`package.json`)}: ` +
        `the "vue" field should be an object.`
      )
      pkgConfig = null
    }

    if (fileConfig) {
      if (pkgConfig) {
        warn(
          `"vue" field in package.json ignored ` +
          `due to presence of ${chalk.bold('vue.config.js')}.`
        )
        warn(
          `You should migrate it into ${chalk.bold('vue.config.js')} ` +
          `and remove it from package.json.`
        )
      }
      resolved = fileConfig
      resovledFrom = 'vue.config.js'
    } else if (pkgConfig) {
      resolved = pkgConfig
      resovledFrom = '"vue" field in package.json'
    } else {
      resolved = inlineOptions || {}
      resovledFrom = 'inline options'
    }

    // normlaize some options
    ensureSlash(resolved, 'baseUrl')
    removeSlash(resolved, 'outputDir')

    // validate options
    validate(resolved, msg => {
      error(
        `Invalid options in ${chalk.bold(resovledFrom)}: ${msg}`
      )
    })

    return resolved
  }
}

function ensureSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key]
      .replace(/^([^/.])/, '/$1')
      .replace(/([^/])$/, '$1/')
  }
}

function removeSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/^\/|\/$/g, '')
  }
}
