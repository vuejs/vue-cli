const joi = require('joi')
const { error } = require('./logger')

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema, options = {}) => {
  joi.validate(obj, schema, options, err => {
    if (err) {
      error(`vue-cli options validation failed:\n` + err.message)
      process.exit(1)
    }
  })
}
