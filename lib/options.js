var path = require('path')
var metadata = require('read-metadata')
var exists = require('fs').existsSync
var getGitUser = require('./git-user')

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

  var author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}

/**
 * Set the default value for a schema key
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault (opts, key, val) {
  var schema = opts.schema || (opts.schema = {})
  if (!schema[key] || typeof schema[key] !== 'object') {
    schema[key] = {
      'type': 'string',
      'default': val
    }
  } else {
    schema[key]['default'] = val
  }
}
