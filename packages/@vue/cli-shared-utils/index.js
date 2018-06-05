[
  'env',
  'exit',
  'ipc',
  'logger',
  'openBrowser',
  'pluginResolution',
  'request',
  'spinner',
  'validate'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})

exports.chalk = require('chalk')
exports.execa = require('execa')
