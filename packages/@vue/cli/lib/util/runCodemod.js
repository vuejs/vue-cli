const adapt = require('vue-jscodeshift-adapter')
let jscodeshift = require('jscodeshift')

module.exports = function runCodemod (transformModule, fileInfo, options = {}) {
  const transform = typeof transformModule.default === 'function'
    ? transformModule.default
    : transformModule

  let parser = transformModule.parser || options.parser
  if (!parser) {
    if (fileInfo.path.endsWith(('.ts'))) {
      parser = 'ts'
    } else if (fileInfo.path.endsWith('.tsx')) {
      parser = 'tsx'
    }
  }

  if (parser) {
    jscodeshift = jscodeshift.withParser(parser)
  }

  const api = {
    jscodeshift,
    j: jscodeshift,
    stats: () => {},
    report: () => {}
  }

  return adapt(transform)(fileInfo, api, options)
}
