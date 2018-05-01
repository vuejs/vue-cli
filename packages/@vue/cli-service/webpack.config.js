// this file is for cases where we need to access the
// webpack config as a file when using CLI commands.

let service = process.VUE_CLI_SERVICE

if (!service) {
  const Service = require('./lib/Service')
  service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
  service.init()
}

module.exports = service.resolveWebpackConfig()
