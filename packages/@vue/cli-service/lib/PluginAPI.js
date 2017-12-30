const path = require('path')

module.exports = class PluginAPI {
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  resolve (_path) {
    return path.resolve(this.service.context, _path)
  }

  setMode (mode) {
    // by default, NODE_ENV and BABEL_ENV are set to "development" unless mode
    // is production. However this can be overwritten in .env files.
    process.env.NODE_ENV = process.env.BABE_ENV = mode === 'production'
      ? mode
      : 'development'
    // load .env files based on mode
    this.service.loadEnv(mode)
  }

  registerCommand (name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = null
    }
    this.service.commands[name] = { fn, opts }
  }

  chainWebpack (fn) {
    this.service.webpackChainFns.push(fn)
  }

  configureWebpack (fn) {
    this.service.webpackRawConfigFns.push(fn)
  }

  resolveWebpackConfig () {
    return this.service.resolveWebpackConfig()
  }

  configureDevServer (fn) {
    this.service.devServerConfigFns.push(fn)
  }
}
