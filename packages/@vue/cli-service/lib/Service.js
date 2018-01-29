const fs = require('fs')
const path = require('path')
const debug = require('debug')
const readPkg = require('read-pkg')
const merge = require('webpack-merge')
const deepMerge = require('deepmerge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const loadEnv = require('./util/loadEnv')
const cosmiconfig = require('cosmiconfig')
const { error } = require('@vue/cli-shared-utils')

const { defaults, validate } = require('./options')

module.exports = class Service {
  constructor (context, { plugins, pkg, projectOptions, useBuiltIn } = {}) {
    process.VUE_CLI_SERVICE = this
    this.context = context
    this.webpackConfig = new Config()
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    this.pkg = this.resolvePkg(pkg)
    this.projectOptions = deepMerge(
      defaults(),
      this.loadProjectOptions(projectOptions)
    )

    debug('vue:project-config')(this.projectOptions)

    // load base .env
    this.loadEnv()

    // install plugins.
    // If there are inline plugins, they will be used instead of those
    // found in pacakge.json.
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
      './config/prod'
    ].map(idToPlugin)

    if (inlinePlugins) {
      return useBuiltIn !== false
        ? builtInPlugins.concat(inlinePlugins)
        : inlinePlugins
    } else {
      const prefixRE = /^(@vue\/|vue-)cli-plugin-/
      const projectPlugins = Object.keys(this.pkg.dependencies || {})
        .concat(Object.keys(this.pkg.devDependencies || {}))
        .filter(p => prefixRE.test(p))
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

  resolveWebpackConfig () {
    // apply chains
    this.webpackChainFns.forEach(fn => fn(this.webpackConfig))
    // to raw config
    let config = this.webpackConfig.toConfig()
    // apply raw config fns
    this.webpackRawConfigFns.forEach(fn => {
      if (typeof fn === 'function') {
        // function with optional return value
        config = fn(config) || config
      } else if (fn) {
        // merge literal values
        config = merge(config, fn)
      }
    })
    return config
  }

  loadProjectOptions (inlineOptions) {
    let resolved
    if (this.pkg.vue) {
      resolved = this.pkg.vue
    } else {
      const explorer = cosmiconfig('vue', {
        rc: false,
        sync: true,
        stopDir: this.context
      })
      try {
        const res = explorer.load(this.context)
        if (res) resolved = res.config
      } catch (e) {
        error(
          `Error loading vue-cli config: ${e.message}`
        )
      }
    }
    resolved = resolved || inlineOptions || {}

    // normlaize some options
    ensureSlash(resolved, 'base')
    removeSlash(resolved, 'outputDir')

    // validate options
    validate(resolved)

    return resolved
  }
}

function ensureSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key]
      .replace(/^([^/])/, '/$1')
      .replace(/([^/])$/, '$1/')
  }
}

function removeSlash (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/^\/|\/$/g, '')
  }
}
