const path = require('path')
const isAbsoluteUrl = require('./isAbsoluteUrl')

module.exports = function getGlobalParams (context) {
  let paramsPath = process.env.VUE_CLI_SERVICE_PARAMS
  if (paramsPath && typeof paramsPath === 'string') {
    if (isAbsoluteUrl(paramsPath)) {
      paramsPath = path.resolve(context, paramsPath)
    }
    try {
      let params = require(paramsPath)
      if (typeof params === 'function') {
        params = params()
      }
      if (typeof params === 'object') {
        return params
      }
    } catch (error) {
      // nothing
    }
  }
  return {}
}
