[
  'env',
  'logger',
  'spinner',
  'validate',
  'openBrowser'
].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})
