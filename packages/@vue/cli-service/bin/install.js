const path = require('path')

const projectDir =
  process.env.VUE_CLI_CONTEXT ||
  path.dirname(require('read-pkg-up').sync().path)

const yorkieWorkingPath = path.resolve(projectDir, 'node_modules/@vue')

require('yorkie/src/install')(yorkieWorkingPath)
