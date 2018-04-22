const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const routeSchema = createSchema(joi => ({
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

exports.validateRoute = (options) => {
  validateSync(options, routeSchema)
}

exports.validateBadge = (options) => {
  validateSync(options, badgeSchema)
}
