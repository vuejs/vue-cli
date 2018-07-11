const joi = require('joi')
const { exit } = require('./exit')

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema, cb) => {
  joi.validate(obj, schema, {}, err => {
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
  const result = joi.validate(obj, schema)
  if (result.error) {
    throw result.error
  }
}
