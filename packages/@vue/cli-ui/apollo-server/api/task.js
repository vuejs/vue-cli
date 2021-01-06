const { createSchema, validateSync } = require('@vue/cli-shared-utils')

const schema = joi => ({
  description: joi.string(),
  link: joi.string().uri(),
  icon: joi.string(),
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
})

const describeSchema = createSchema(joi => ({
  match: joi.alternatives().try(joi.object().instance(RegExp), joi.func()).required().description('Match a npm script command'),
  ...schema(joi)
}))

const addSchema = createSchema(joi => ({
  name: joi.string().required(),
  command: joi.string().required(),
  ...schema(joi)
}))

exports.validateDescribeTask = (options) => {
  validateSync(options, describeSchema)
}

exports.validateAddTask = (options) => {
  validateSync(options, addSchema)
}
