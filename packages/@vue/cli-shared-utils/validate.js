const joi = require('joi')

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema, options = {}) => {
  joi.validate(obj, schema, options, err => {
    if (err) {
      throw err
    }
  })
}
