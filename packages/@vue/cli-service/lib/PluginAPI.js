const path = require('path')

module.exports = class PluginAPI {
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  resolve (_path) {
    return path.resolve(this.service.context, _path)
  }

  registerCommand (name, fn) {
    this.service.commands[name] = fn
  }

  chainWebpack (fn) {
    this.service.webpackChainFns.push(fn)
  }

  configureWebpack (fn) {
    this.service.webpackRawConfigFns.push(fn)
  }
}
