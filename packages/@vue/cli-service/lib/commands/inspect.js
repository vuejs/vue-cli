module.exports = (api, options) => {
  api.registerCommand('inspect', {
    description: 'inspect internal webpack config',
    usage: 'vue-cli-service inspect [options] [...keys]',
    options: {
      '--mode': 'specify env mode (default: development)'
    }
  }, args => {
    api.setMode(args.mode || 'development')

    const stringify = require('javascript-stringify')
    const config = api.resolveWebpackConfig()
    const keys = args._

    let res
    if (keys.length) {
      res = {}
      keys.forEach(key => {
        res[key] = config[key]
      })
    } else {
      res = config
    }

    // TODO improve stringification for loaders, plugins etc.
    console.log(stringify(res, null, 2))
  })
}
