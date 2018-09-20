const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  id: joi.string().required(),
  title: joi.string().required(),
  description: joi.string(),
  icon: joi.string(),
  screenshot: joi.string(),
  link: joi.string(),
  component: joi.string().required(),
  // Maximum number of instances
  maxCount: joi.number(),
  // Size
  minWidth: joi.number().required(),
  minHeight: joi.number().required(),
  maxWidth: joi.number().required(),
  maxHeight: joi.number().required(),
  defaultWidth: joi.number(),
  defaultHeight: joi.number(),
  // Config
  configPrompts: joi.func(),
  defaultConfig: joi.func(),
  needsUserConfig: joi.boolean(),
  // Hooks
  onAdded: joi.func(),
  onRemoved: joi.func(),
  onConfigChanged: joi.func()
}))

exports.validateWidget = (options) => {
  validateSync(options, schema)
}
