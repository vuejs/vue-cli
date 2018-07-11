module.exports = (api, options) => {
  api.registerCommand('inspect', {
    description: 'inspect internal webpack config',
    usage: 'vue-cli-service inspect [options] [...paths]',
    options: {
      '--mode': 'specify env mode (default: development)',
      '--rule <ruleName>': 'inspect a specific module rule',
      '--plugin <pluginName>': 'inspect a specific plugin',
      '--rules': 'list all module rule names',
      '--plugins': 'list all plugin names',
      '--verbose': 'show full function definitions in output'
    }
  }, args => {
    const { get } = require('@vue/cli-shared-utils')
    const { toString } = require('webpack-chain')
    const config = api.resolveWebpackConfig()
    const { _: paths, verbose } = args

    let res
    if (args.rule) {
      res = config.module.rules.find(r => r.__ruleNames[0] === args.rule)
    } else if (args.plugin) {
      res = config.plugins.find(p => p.__pluginName === args.plugin)
    } else if (args.rules) {
      res = config.module.rules.map(r => r.__ruleNames[0])
    } else if (args.plugins) {
      res = config.plugins.map(p => p.__pluginName)
    } else if (paths.length > 1) {
      res = {}
      paths.forEach(path => {
        res[path] = get(config, path)
      })
    } else if (paths.length === 1) {
      res = get(config, paths[0])
    } else {
      res = config
    }

    const output = toString(res, { verbose })
    console.log(output)
  })
}

module.exports.defaultModes = {
  inspect: 'development'
}
