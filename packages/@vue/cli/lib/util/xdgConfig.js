const fs = require('fs')
const path = require('path')

exports.xdgConfigPath = (file) => {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME
  if (xdgConfigHome) {
    const rcDir = path.join(xdgConfigHome, 'vue')
    if (!fs.existsSync(rcDir)) {
      fs.mkdirSync(rcDir, 0o700)
    }
    return path.join(rcDir, file)
  }

  return undefined
}
