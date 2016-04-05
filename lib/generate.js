var Metalsmith = require('metalsmith')
var inquirer = require('inquirer')
var async = require('async')
var render = require('consolidate').handlebars.render
var path = require('path')

var promptInquirerTypeMapping = {
  string: 'input',
  boolean: 'confirm'
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

module.exports = function (name) {
  var options = require('../lib/options')(name)

  /**
   * Prompt plugin.
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */

  function ask (files, metalsmith, done) {
    var opts = options(metalsmith._directory + '/..')

    var prompts = Object.keys(opts.schema)
    var metalsmithMetadata = metalsmith.metadata()

    async.eachSeries(prompts, run, done)

    function run (key, done) {
      var prompt = opts.schema[key]

      inquirer.prompt([{
        type: promptInquirerTypeMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.label || key,
        default: prompt.default,
        choices: prompt.choices || []
      }], function (answers) {
        if (Array.isArray(answers[key])) {
          metalsmithMetadata[key] = {}
          answers[key].forEach(function (multiChoiceAnswer) {
            metalsmithMetadata[key][multiChoiceAnswer] = true
          })
        } else {
          metalsmithMetadata[key] = answers[key]
        }

        done()
      })
    }
  }

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
