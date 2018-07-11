const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  status: joi.string().required(),
  error: joi.string(),
  info: joi.string(),
  progress: joi.number(),
  args: joi.array()
}))

exports.validateProgress = (options) => {
  validateSync(options, schema)
}
