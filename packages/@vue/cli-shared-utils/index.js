[
  'env',
  'logger',
  'spinner',
  'validate',
  'openBrowser',
  'pluginResolution',
  'babelHelpers'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
