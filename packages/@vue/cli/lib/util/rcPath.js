const fs = require('fs')
const os = require('os')
const path = require('path')

exports.xdgConfigPath = () => {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME
  if (xdgConfigHome) {
    const rcDir = path.join(xdgConfigHome, 'vue')
    if (!fs.existsSync(rcDir)) {
      fs.mkdirSync(rcDir, 0o700)
    }
    return path.join(rcDir, '.vuerc')
  }
}

exports.windowsConfigPath = file => {
  if (process.platform !== 'win32') {
    return
  }
  const appData = process.env.APPDATA
  if (appData) {
    const rcDir = path.join(appData, 'vue')
    if (!fs.existsSync(rcDir)) {
      fs.mkdirSync(rcDir)
    }
    const rcPath = path.join(rcDir, '.vuerc')
    // migration for < 3.0.0-rc.7
    const oldRcFile = path.join(os.homedir(), '.vuerc')
    if (fs.existsSync(oldRcFile)) {
      fs.writeFileSync(rcPath, fs.readFileSync(oldRcFile))
      const chalk = require('chalk')
      console.log(`Detected ${chalk.cyan(`.vuerc`)} in ${chalk.cyan(path.dirname(oldRcFile))}...`)
      console.log(`Migrated to ${chalk.cyan(rcPath)}.`)
    }
    return rcPath
  }
}
