/**
 * This file is copied during the firefox test inside the project folder and used to inspect the results
 */
const fs = require('fs')

module.exports = {
  reporter (results, cb) {
    fs.writeFile('test_results_gecko.json', JSON.stringify(results), cb)
  }
}
