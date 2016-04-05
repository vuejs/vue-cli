var async = require('async')

/**
 * Metalsmith ask plugin.
 *
 * @param {Function} options
 * @param {Function} prompt
 */

function ask (options, prompt) {
  return function (files, metalsmith, done) {
    var opts = options(metalsmith._directory + '/..')

    var prompts = Object.keys(opts.schema)
    var metalsmithMetadata = metalsmith.metadata()

    async.eachSeries(prompts, run, done)

    function run (key, done) {
      prompt(metalsmithMetadata, key, opts.schema[key], done)
    }
  }
}

module.exports = function (options, prompt) {
  return ask(options, prompt)
}
