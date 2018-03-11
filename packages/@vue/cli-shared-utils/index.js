[
  'env',
  'logger',
  'spinner',
  'validate',
  'openBrowser',
  'pluginResolution',
  'exit',
  'request'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
