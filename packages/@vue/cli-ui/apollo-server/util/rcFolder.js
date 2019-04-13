const fs = require('fs-extra')
const path = require('path')

const { getRcPath } = require('@vue/cli/lib/util/rcPath')

let folder

if (process.env.VUE_CLI_UI_TEST) {
  folder = path.resolve(__dirname, '../../live-test')
  // Clean DB
  fs.removeSync(path.resolve(__dirname, folder))
} else if (process.env.VUE_APP_CLI_UI_DEV) {
  folder = path.resolve(__dirname, '../../live')
} else {
  folder =
    (process.env.VUE_CLI_UI_DB_PATH &&
      path.resolve(__dirname, process.env.VUE_CLI_UI_DB_PATH)) ||
    getRcPath('.vue-cli-ui')
}

fs.ensureDirSync(path.resolve(__dirname, folder))

exports.rcFolder = folder
