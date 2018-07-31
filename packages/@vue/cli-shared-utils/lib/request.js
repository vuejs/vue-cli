exports.request = {
  get (uri) {
    // lazy require
    const request = require('request-promise-native')
    const reqOpts = {
      method: 'GET',
      resolveWithFullResponse: true,
      json: true,
      uri
    }

    return request(reqOpts)
  }
}
