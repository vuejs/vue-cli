// this file is for cases where we need to access the
// webpack config as a file when using CLI commands.
const path = require('path')

let vueCliContext = process.env.VUE_CLI_CONTEXT
let service = process.VUE_CLI_SERVICE

if (!service || process.env.VUE_CLI_API_MODE) {
  const Service = require('./lib/Service')
  if (vueCliContext && !path.isAbsolute(vueCliContext)) {
     vueCliContext = path.resolve(process.cwd(), vueCliContext)
  }
  service = new Service(vueCliContext || process.cwd())
  service.init(process.env.VUE_CLI_MODE || process.env.NODE_ENV)
}

module.exports = service.resolveWebpackConfig()
