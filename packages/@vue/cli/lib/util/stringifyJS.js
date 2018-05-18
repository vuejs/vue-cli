const stringify = require('javascript-stringify')

module.exports = function stringifyJS (value) {
  return stringify(value, (val, indent, stringify) => {
    if (val && val.__expression) {
      return val.__expression
    }
    return stringify(val)
  }, 2)
}
