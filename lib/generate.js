var Metalsmith = require('metalsmith')
var Handlebars = require('handlebars')
var async = require('async')
var render = require('consolidate').handlebars.render
var path = require('path')
var getOptions = require('./options')
var ask = require('./ask')
var filter = require('./filter')

// register hendlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b
    ? opts.fn(this)
    : opts.inverse(this)
})

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
  var metalsmith = Metalsmith(path.join(src, 'template'))
  var data = metalsmith.metadata()
  // avoid handlebars escaping HTML
  data.noEscape = true
  metalsmith
    .use(askQuestions(opts.schema))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles)
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build(function (err) {
      done(err)
      if (opts.completeMessage) {
        formatMessage(opts.completeMessage, data, function (err, message) {
          if (err) return done(err)
          console.log(message)
        })
      }
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

/**
 * Format complete message.
 *
 * @param {String} message
 * @param {Object} data
 * @param {Function} cb
 */

function formatMessage (message, data, cb) {
  render(message, data, function (err, res) {
    if (err) return cb(err)
    cb(null, '\n' + res.split(/\r?\n/g).map(function (line) {
      return '   ' + line
    }).join('\n'))
  })
}
