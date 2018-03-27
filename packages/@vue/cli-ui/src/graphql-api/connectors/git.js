const execa = require('execa')
const parseDiff = require('parse-diff')
// Connectors
const cwd = require('./cwd')

async function getDiffs (context) {
  const { stdout } = await execa('git', ['diff', 'HEAD'], {
    cwd: cwd.get()
  })
  return parseDiff(stdout).map(
    fileDiff => ({
      id: fileDiff.index.join(' '),
      ...fileDiff
    })
  )
}

async function commit (message, context) {
  await execa('git', ['add', '*'], {
    cwd: cwd.get()
  })
  await execa('git', ['commit', '-m', message.replace(/"/, '\\"')], {
    cwd: cwd.get()
  })
  return true
}

module.exports = {
  getDiffs,
  commit
}
