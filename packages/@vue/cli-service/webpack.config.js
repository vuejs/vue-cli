// this file is for cases where we need to access the
// webpack config as a file when using CLI commands.

let service = process.VUE_CLI_SERVICE

if (!service || process.env.VUE_CLI_API_MODE) {
  const Service = require('./lib/Service')
  const getGlobalParams = require('./lib/util/getGlobalParams')
  const context = process.env.VUE_CLI_CONTEXT || process.cwd()
  service = new Service(context, getGlobalParams(context))
  service.init(process.env.VUE_CLI_MODE || process.env.NODE_ENV)
}

module.exports = service.resolveWebpackConfig()
