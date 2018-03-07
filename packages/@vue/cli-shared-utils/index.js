[
  'env',
  'logger',
  'spinner',
  'validate',
  'openBrowser',
  'pluginResolution',
  'exit'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
