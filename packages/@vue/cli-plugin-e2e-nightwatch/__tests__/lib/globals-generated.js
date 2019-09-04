/**
 * This file is copied during the test inside the project folder and used to inpsect the results
 */
const fs = require('fs')

module.exports = {
  afterEach (browser, cb) {
    fs.writeFile('test_settings.json', JSON.stringify(browser.options), cb)
  },

  reporter (results, cb) {
    fs.writeFile('test_results.json', JSON.stringify(results), cb)
  }
}
