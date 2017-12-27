const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const getPkg = require('read-pkg-up')
const merge = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')

module.exports = class Service {
  constructor () {
    this.webpackConfig = new Config()
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.commands = {}

    const pkg = getPkg.sync()
    this.pkg = pkg.pkg || {}
    this.context = path.dirname(pkg.path)
    this.projectOptions = this.loadProjectConfig()

    // install plugins
    this.resolvePlugins().forEach(({ id, apply }) => {
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

  resolvePlugins () {
    const builtInPlugins = [
      './command-plugins/serve',
      './command-plugins/build',
      './command-plugins/inspect',
      './command-plugins/help',
      './config-plugins/base',
      './config-plugins/css',
      './config-plugins/dev',
      './config-plugins/prod'
    ]
    const prefixRE = /^(@vue\/|vue-)cli-plugin-/
    const projectPlugins = Object.keys(this.pkg.dependencies || {})
      .concat(Object.keys(this.pkg.devDependencies || {}))
      .filter(p => prefixRE.test(p))
    return builtInPlugins.concat(projectPlugins).map(id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    }))
  }

  run (name, args) {
    let command = this.commands[name]
    if (!command && name) {
      console.log(chalk.red(`\n  command "${name}" does not exist.`))
    }
    if (!command || args.help) {
      command = this.commands.help
    } else {
      args._.shift() // remove command itself
    }
    const { fn } = command
    return fn(args)
  }

  resolveWebpackConfig (env) {
    if (env) {
      process.env.NODE_ENV = env
    }
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

  loadProjectConfig () {
    // vue.config.js
    const configPath = path.resolve(this.context, 'vue.config.js')
    if (fs.existsSync(configPath)) {
      const config = require(configPath)
      if (!config || typeof config !== 'object') {
        console.log(chalk.red(
          `\n  Error loading vue.config.js: should export an object.\n`
        ))
        return {}
      } else {
        return config
      }
    }
    // package.vue
    const config = this.pkg['vue-cli']
    if (config) {
      if (typeof config !== 'object') {
        console.log(chalk.red(
          `\n  Error loading vue-cli config in package.json: ` +
          `the "vue" field should be an object.\n`
        ))
        return {}
      }
      return config
    }
    return {}
  }
}
