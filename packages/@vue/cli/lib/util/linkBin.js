// cross-platform executable link, mostly for Windows

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const chmod = promisify(fs.chmod)
const symlink = promisify(fs.symlink)
const mkdirp = promisify(require('mkdirp'))
const cmdShim = promisify(require('cmd-shim'))

exports.linkBin = async (src, dest) => {
  if (!process.env.VUE_CLI_TEST && !process.env.VUE_CLI_DEBUG) {
    throw new Error(`linkBin should only be used during tests or debugging.`)
  }
  if (process.platform === 'win32' && !process.env.CI) {
    // not doing mutex lock because this is only used in dev and the
    // src will not be modified
    await cmdShim(src, dest)
  } else {
    await mkdirp(path.dirname(dest))
    await symlink(src, dest)
    await chmod(dest, '755')
  }
}
