exports.request = {
  get (uri) {
    // lazy require
    const request = require('request-promise-native')
    const reqOpts = {
      method: 'GET',
      timeout: 30000,
      resolveWithFullResponse: true,
      json: true,
      uri
    }

    return request(reqOpts)
  }
}
