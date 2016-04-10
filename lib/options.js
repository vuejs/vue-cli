var path = require('path')
var metadata = require('read-metadata')
var exists = require('fs').existsSync
var getGitUser = require('./git-user')
var validateName = require('validate-npm-package-name')

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

module.exports = function options (name, dir) {
  var file = path.join(dir, 'meta.json')
  var opts = exists(file)
    ? metadata.sync(file)
    : {}

  setDefault(opts, 'name', name)
  setValidateName(opts)

  var author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault (opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema
    delete opts.schema
  }
  var prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    prompts[key]['default'] = val
  }
}

function setValidateName (opts) {
  opts.prompts.name.validate = function (name) {
    var its = validateName(name)
    if (!its.validForNewPackages) {
      var errors = (its.errors || []).concat(its.warnings || [])
      return 'Sorry, ' + errors.join(' and ') + '.'
    }
    return true
  }
}
