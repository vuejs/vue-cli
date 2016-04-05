var async = require('async')

/**
 * Prompt plugin.
 *
 * @param {Function} options
 * @param {Function} promptFn
 */

function ask (options, promptFn) {
  return function (files, metalsmith, done) {
    var opts = options(metalsmith._directory + '/..')

    var prompts = Object.keys(opts.schema)
    var metalsmithMetadata = metalsmith.metadata()

    async.eachSeries(prompts, run, done)

    function run (key, done) {
      var prompt = opts.schema[key]

      promptFn(metalsmithMetadata, key, prompt, done)
    }
  }
}

module.exports = function (options, promptFn) {
  return ask(options, promptFn)
}
