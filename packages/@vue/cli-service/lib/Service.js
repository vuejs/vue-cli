const { dirname } = require('path')
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

    const { pkg, path } = getPkg.sync()
    this.context = dirname(path)
    this.projectOptions = this.loadProjectConfig()

    // install plugins
    this.resolvePlugins(pkg).forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // TODO apply webpack modifications from project config file
  }

  resolvePlugins (pkg) {
    const builtInPlugins = [
      './command-plugins/serve',
      './command-plugins/build',
      './command-plugins/inspect',
      './config-plugins/base',
      './config-plugins/css',
      './config-plugins/dev',
      './config-plugins/prod'
    ]
    const prefixRE = /^(@vue\/|vue-)cli-plugin-/
    const projectPlugins = Object.keys(pkg.dependencies || {})
      .concat(Object.keys(pkg.devDependencies || {}))
      .filter(p => prefixRE.test(p))
    return builtInPlugins.concat(projectPlugins).map(id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    }))
  }

  run (command, args) {
    if (this.commands[command]) {
      args._.shift() // remove command itself
      this.commands[command].call(
        null,
        this.getWebpackConfig.bind(this),
        args
      )
    } else {
      // TODO warn unknown command
    }
  }

  getWebpackConfig () {
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
    // TODO
    return {}
  }
}
