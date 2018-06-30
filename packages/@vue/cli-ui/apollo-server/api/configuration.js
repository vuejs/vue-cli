const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  id: joi.string().required(),
  name: joi.string().required(),
  description: joi.string(),
  link: joi.string().uri(),
  icon: joi.string(),
  files: joi.object().pattern(/^/, joi.object({
    json: joi.array().items(joi.string()),
    js: joi.array().items(joi.string()),
    yaml: joi.array().items(joi.string()),
    package: joi.string()
  })),
  onRead: joi.func().required(),
  onWrite: joi.func().required()
}))

exports.validateConfiguration = (options) => {
  validateSync(options, schema)
}
