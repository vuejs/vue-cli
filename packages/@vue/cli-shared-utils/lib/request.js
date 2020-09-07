exports.request = {
  get (url, opts) {
    // lazy require
    const got = require('got')
    const reqOpts = {
      method: 'GET',
      timeout: 30000,
      responseType: 'json',
      url,
      ...opts
    }

    return got(reqOpts)
  }
}
