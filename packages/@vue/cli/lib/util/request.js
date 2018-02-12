const request = require('request-promise-native')

module.exports = {
  async get (uri) {
    const reqOpts = {
      method: 'GET',
      resolveWithFullResponse: true,
      json: true,
      uri
    }

    return request(reqOpts)
  }
}
