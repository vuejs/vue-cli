[
  'env',
  'exit',
  'ipc',
  'cache',
  'logger',
  'openBrowser',
  'pluginResolution',
  'request',
  'spinner',
  'validate'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
