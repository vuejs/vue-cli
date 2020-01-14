const util = require('util')
const cp = require('child_process')
const path = require('path')
const {
  isWindows,
  isLinux,
  isMacintosh
} = require('@vue/cli-shared-utils')

const execFile = util.promisify(cp.execFile)
const spawn = util.promisify(cp.spawn)

exports.terminate = async function (childProcess, cwd) {
  if (isWindows) {
    try {
      const options = {
        stdio: ['pipe', 'pipe', 'ignore']
      }
      if (cwd) {
        options.cwd = cwd
      }
      await execFile('taskkill', ['/T', '/F', '/PID', childProcess.pid.toString()], options)
    } catch (err) {
      return { success: false, error: err }
    }
  } else if (isLinux || isMacintosh) {
    try {
      const cmd = path.resolve(__dirname, './terminate.sh')
      const result = await spawn(cmd, [childProcess.pid.toString()], {
        cwd
      })
      if (result.error) {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: err }
    }
  } else {
    childProcess.kill('SIGKILL')
  }
  return { success: true }
}
