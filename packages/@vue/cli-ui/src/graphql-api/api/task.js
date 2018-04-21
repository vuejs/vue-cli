const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => ({
  match: joi.object().type(RegExp).required().description('Match a npm script command'),
  description: joi.string(),
  link: joi.string().uri(),
  prompts: joi.array(),
  views: joi.array().items(joi.object({
    id: joi.string().required(),
    label: joi.string().required(),
    icon: joi.string(),
    component: joi.string().required()
  })),
  defaultView: joi.string(),
  onBeforeRun: joi.func(),
  onRun: joi.func(),
  onExit: joi.func()
}))

exports.validate = (options) => {
  validateSync(options, schema)
}
