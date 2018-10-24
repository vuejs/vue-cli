const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  id: joi.string().required(),
  // General
  title: joi.string().required(),
  description: joi.string(),
  longDescription: joi.string(),
  icon: joi.string(),
  screenshot: joi.string(),
  link: joi.string(),
  // Components
  component: joi.string().required(),
  detailsComponent: joi.string(),
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
  defaultConfig: joi.func(),
  needsUserConfig: joi.boolean(),
  // UI
  openDetailsButton: joi.boolean(),
  // Hooks
  onAdded: joi.func(),
  onRemoved: joi.func(),
  onConfigOpen: joi.func(),
  onConfigChanged: joi.func()
}))

exports.validateWidget = (options) => {
  validateSync(options, schema)
}
