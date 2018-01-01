// this file is for cases where we need to access the
// webpack config as a file when using CLI commands.

let service = process.VUE_CLI_SERVICE

if (!service) {
  const Service = require('./lib/service')
  service = new Service()
}

module.exports = service.resolveWebpackConfig()
