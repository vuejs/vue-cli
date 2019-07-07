const jscodeshift = require('jscodeshift')
const adapt = require('vue-jscodeshift-adapter')

module.exports = function runCodemod (transform, fileInfo, options) {
  return adapt(transform)(fileInfo, { jscodeshift }, options || {})
}
