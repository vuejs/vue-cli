var Metalsmith = require('metalsmith')
var async = require('async')
var render = require('consolidate').handlebars.render
var path = require('path')
var getOptions = require('./options')
var ask = require('./ask')
var filter = require('./filter')

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function generate (name, src, dest, done) {
  var opts = getOptions(name, src)
  Metalsmith(path.join(src, 'template'))
    .use(askQuestions(opts.schema))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles)
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build(function (err) {
      if (err) throw err
      done()
    })
}

/**
 * Create a middleware for asking questions.
 *
 * @param {Object} schema
 * @return {Function}
 */

function askQuestions (schema) {
  return function (files, metalsmith, done) {
    ask(schema, metalsmith.metadata(), done)
  }
}

/**
 * Create a middleware for filtering files.
 *
 * @param {Object} filters
 * @return {Function}
 */

function filterFiles (filters) {
  return function (files, metalsmith, done) {
    filter(files, filters, metalsmith.metadata(), done)
  }
}

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
  metalsmithMetadata.noEscape = true
  async.each(keys, function (file, next) {
    var str = files[file].contents.toString()
    // do not attempt to render files that do not have mustaches
    if (!/{{([^{}]+)}}/g.test(str)) {
      return next()
    }
    render(str, metalsmithMetadata, function (err, res) {
      if (err) return next(err)
      files[file].contents = new Buffer(res)
      next()
    })
  }, done)
}
