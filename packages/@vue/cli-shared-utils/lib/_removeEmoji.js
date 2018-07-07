const { replace } = require('node-emoji')

module.exports = function (exports) {
  Object.keys(exports).forEach(key => {
    const func = exports[key]
    exports[key] = (...args) => {
      func(
        ...args.map(arg => typeof arg === 'string' ? replace(arg, '') : arg)
      )
    }
  })
}
