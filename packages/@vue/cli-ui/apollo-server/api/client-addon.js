const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  id: joi.string().required(),
  path: joi.string(),
  url: joi.string()
}))

exports.validateClientAddon = (options) => {
  validateSync(options, schema)
}
