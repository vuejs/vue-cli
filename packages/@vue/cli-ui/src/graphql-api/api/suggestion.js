const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  id: joi.string().required(),
  label: joi.string().required(),
  type: joi.string().required(),
  handler: joi.func(),
  actionLink: joi.string(),
  importance: joi.string(),
  message: joi.string(),
  link: joi.string(),
  image: joi.string()
}))

exports.validateSuggestion = (options) => {
  validateSync(options, schema)
}
