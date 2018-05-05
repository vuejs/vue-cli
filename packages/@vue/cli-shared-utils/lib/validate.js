const joi = require('joi')

// proxy to joi for option validation
exports.createSchema = fn => fn(joi)

exports.validate = (obj, schema, cb) => {
  joi.validate(obj, schema, {}, err => {
    if (err) {
      cb(err.message)
      if (process.env.VUE_CLI_TEST) {
        throw err
      } else {
        process.exit(1)
      }
    }
  })
}
