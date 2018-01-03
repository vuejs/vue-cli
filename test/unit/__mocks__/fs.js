const { fs } = require('memfs')

// overwrite config path when fs is mocked
process.env.VUE_CLI_CONFIG_PATH = '/.vuerc'

module.exports = fs
