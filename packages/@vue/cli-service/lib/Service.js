const getPkg = require('read-pkg-up')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')

module.exports = class Service {
  constructor () {
    this.webpackConfig = new Config()
    this.webpackRawConfigFns = []
    this.commands = {}

    this.resolvePlugins().forEach(({ id, apply }) => {
      apply(new PluginAPI(id, this))
    })
  }

  resolvePlugins () {
    const builtInPlugins = [
      './command-plugins/serve',
      './command-plugins/build',
      './config-plugins/core',
      './config-plugins/vue',
      './config-plugins/css',
      './config-plugins/dev',
      './config-plugins/prod'
    ]
    const projectPkg = getPkg.sync()
    const prefixRE = /^(@vue\/|vue-)cli-plugin-/
    const projectPlugins = Object.keys(projectPkg.dependencies || [])
      .concat(projectPkg.devDependencies || [])
      .filter(p => prefixRE.test(p))
    return builtInPlugins.concat(projectPlugins).map(id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    }))
  }

  run (command, args) {
    if (this.commands[command]) {
      const getConfig = () => {
        const base = this.webpackConfig.toConfig()
        this.webpackRawConfigFns.forEach(fn => fn(base))
        return base
      }
      this.commands[command].call(null, getConfig, this.options, args)
    } else {
      // TODO warn unknown command
    }
  }
}
