// cross-platform executable link, mostly for Windows
// this file is dev-only.

const fs = require('fs-extra')
const path = require('path')
const cmdShim = require('cmd-shim')

exports.linkBin = async (src, dest) => {
  if (!process.env.VUE_CLI_TEST && !process.env.VUE_CLI_DEBUG) {
    throw new Error(`linkBin should only be used during tests or debugging.`)
  }
  if (process.platform === 'win32' && !process.env.CI) {
    // not doing mutex lock because this is only used in dev and the
    // src will not be modified
    await cmdShim(src, dest)
  } else {
    await fs.ensureDir(path.dirname(dest))
    await fs.symlink(src, dest)
    await fs.chmod(dest, '755')
  }
}
