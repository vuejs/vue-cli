const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const viewSchema = createSchema(joi => ({
  id: joi.string().required(),
  name: joi.string().required().description('route name (vue-router)'),
  icon: joi.string().required(),
  tooltip: joi.string().required()
}))

const badgeSchema = createSchema(joi => ({
  id: joi.string().required(),
  type: joi.string(),
  label: joi.string().required(),
  priority: joi.number().integer(),
  hidden: joi.boolean()
}))

exports.validateView = (options) => {
  validateSync(options, viewSchema)
}

exports.validateBadge = (options) => {
  validateSync(options, badgeSchema)
}
