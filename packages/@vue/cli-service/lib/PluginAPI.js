module.exports = class PluginAPI {
  constructor (id, service) {
    this.id = id
    this.service = service
  }

  registerCommand (name, fn) {
    this.service.commands[name] = fn
  }

  chainWebpack (fn) {
    fn(this.service.webpackConfig)
  }

  configureWebpack (fn) {
    this.service.webpackRawConfigFns.push(fn)
  }
}
