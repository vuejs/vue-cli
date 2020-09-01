exports.request = {
  get (uri, opts) {
    // lazy require
    const request = require('util').promisify(require('request'))
    const reqOpts = {
      method: 'GET',
      timeout: 30000,
      resolveWithFullResponse: true,
      json: true,
      uri,
      ...opts
    }

    return request(reqOpts)
  }
}
