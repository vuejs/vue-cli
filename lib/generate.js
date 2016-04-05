var Metalsmith = require('metalsmith')
var async = require('async')
var render = require('consolidate').handlebars.render
var path = require('path')

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function renderTemplateFiles (files, metalsmith, done) {
  var keys = Object.keys(files)
  var metalsmithMetadata = metalsmith.metadata()

  async.each(keys, run, done)

  function run (file, done) {
    var str = files[file].contents.toString()
    // do not attempt to render files that do not have mustaches
    if (!/\{\{[#^] *(\w+) *\}\}/.test(str)) {
      return done()
    }
    render(str, metalsmithMetadata, function (err, res) {
      if (err) return done(err)
      files[file].contents = new Buffer(res)
      done()
    })
  }
}

module.exports = function (ask) {
  /**
   * Generate a template given a `src` and `dest`.
   *
   * @param {String} src
   * @param {String} dest
   * @param {Function} fn
   */

  function generate (src, dest, fn) {
    var template = path.join(src, 'template')

    Metalsmith(template)
      .use(ask)
      .use(renderTemplateFiles)
      .clean(false)
      .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
      .destination(dest)
      .build(function (err) {
        if (err) throw err
        fn()
      })
  }

  return generate
}
