const { exit } = require('./exit')

// proxy to joi for option validation
exports.createSchema = fn => fn(require('@hapi/joi'))

exports.validate = (obj, schema, cb) => {
  require('@hapi/joi').validate(obj, schema, {}, err => {
    if (err) {
      cb(err.message)
      if (process.env.VUE_CLI_TEST) {
        throw err
      } else {
        exit(1)
      }
    }
  })
}

exports.validateSync = (obj, schema) => {
  const result = require('@hapi/joi').validate(obj, schema)
  if (result.error) {
    throw result.error
  }
}
