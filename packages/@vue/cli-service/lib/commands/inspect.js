module.exports = (api, options) => {
  api.registerCommand('inspect', {
    description: 'inspect internal webpack config',
    usage: 'vue-cli-service inspect [options] [...paths]',
    options: {
      '--mode': 'specify env mode (default: development)',
      '--verbose': 'show full function definitions in output'
    }
  }, args => {
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

    const pluginRE = /(?:function|class) (\w+Plugin)/
    console.log(stringify(res, (value, indent, stringify) => {
      if (!args.verbose) {
        if (typeof value === 'function' && value.toString().length > 100) {
          return `function () { /* omitted long function */ }`
        }
        if (value && typeof value.constructor === 'function') {
          const match = value.constructor.toString().match(pluginRE)
          if (match) {
            return `/* ${match[1]} */ ` + stringify(value)
          }
        }
      }
      return stringify(value)
    }, 2))
  })
}

module.exports.defaultModes = {
  inspect: 'development'
}
