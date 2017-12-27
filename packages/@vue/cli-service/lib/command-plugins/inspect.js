module.exports = (api, options) => {
  api.registerCommand('inspect', (getWebpackConfig, args) => {
    if (args.env) {
      process.env.NODE_ENV = args.env
    }
    const stringify = require('javascript-stringify')
    const config = getWebpackConfig()
    const key = args._[0]

    console.log(stringify(key ? config[key] : config, null, 2))
  })
}
