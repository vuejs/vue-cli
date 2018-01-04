module.exports = (api, options) => {
  api.registerCommand('inspect', {
    description: 'inspect internal webpack config',
    usage: 'vue-cli-service inspect [options] [...paths]',
    options: {
      '--mode': 'specify env mode (default: development)'
    }
  }, args => {
    api.setMode(args.mode || 'development')

    const get = require('get-value')
    const stringify = require('javascript-stringify')
    const config = api.resolveWebpackConfig()
    const paths = args._

    let res
    if (paths.length > 1) {
      res = {}
      paths.forEach(path => {
        res[path] = get(config, path)
      })
    } else if (paths.length === 1) {
      res = get(config, paths[0])
    } else {
      res = config
    }

    // TODO improve stringification for loaders, plugins etc.
    console.log(stringify(res, null, 2))
  })
}
