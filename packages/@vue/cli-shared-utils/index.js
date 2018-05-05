[
  'env',
  'logger',
  'spinner',
  'validate',
  'openBrowser',
  'pluginResolution'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
