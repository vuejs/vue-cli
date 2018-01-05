const { fs } = require('memfs')

// overwrite config path and context when fs is mocked
process.env.VUE_CLI_CONTEXT = '/'
process.env.VUE_CLI_CONFIG_PATH = '/.vuerc'

module.exports = fs
