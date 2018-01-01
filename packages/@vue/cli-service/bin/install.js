const path = require('path')

const projectDir =
  process.env.VUE_CLI_CONTEXT ||
  path.dirname(require('read-pkg-up').sync().path)

const huskyWorkingPath = path.resolve(projectDir, 'node_modules', '@vue')

require('husky/src/install')(huskyWorkingPath)
