module.exports = function silence (exports) {
  const logs = {}
  Object.keys(exports).forEach(key => {
    if (key !== 'error') {
      exports[key] = (...args) => {
        if (!logs[key]) logs[key] = []
        logs[key].push(args)
      }
    }
  })
  exports.logs = logs
}
