const joi = require('joi')
const { error } = require('./logger')

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema, options = {}, noExit) => {
  joi.validate(obj, schema, options, err => {
    if (err) {
      error(`vue-cli options validation failed:\n` + err.message)
      if (!noExit) {
        process.exit(1)
      } else {
        throw err
      }
    }
  })
}
