const execa = require('execa')
const path = require('path')
const parseDiff = require('../util/parse-diff')
// Connectors
const cwd = require('./cwd')
// Utils
const { hasProjectGit } = require('@vue/cli-shared-utils')

async function getNewFiles (context) {
  if (!hasProjectGit(cwd.get())) return []

  const { stdout } = await execa('git', [
    'ls-files',
    '-o',
    '--exclude-standard',
    '--full-name'
  ], {
    cwd: cwd.get()
  })
  if (stdout.trim()) {
    return stdout.split(/\r?\n/g)
  }
  return []
}

async function getDiffs (context) {
  if (!hasProjectGit(cwd.get())) return []

  const newFiles = await getNewFiles(context)
  await execa('git', ['add', '-N', '*'], {
    cwd: cwd.get()
  })
  const { stdout } = await execa('git', ['diff'], {
    cwd: cwd.get()
  })
  await reset(context)
  const list = parseDiff(stdout).map(
    fileDiff => ({
      id: fileDiff.index.join(' '),
      ...fileDiff,
      new: newFiles.includes(fileDiff.to)
    })
  )

  return list
}

async function commit (message, context) {
  if (!hasProjectGit(cwd.get())) return false

  await execa('git', ['add', '*'], {
    cwd: cwd.get()
  })
  await execa('git', ['commit', '-m', message.replace(/"/, '\\"')], {
    cwd: cwd.get()
  })
  return true
}

async function reset (context) {
  if (!hasProjectGit(cwd.get())) return false

  await execa('git', ['reset'], {
    cwd: cwd.get()
  })
  return true
}

async function getRoot (context) {
  if (!hasProjectGit(cwd.get())) return cwd.get()

  const { stdout } = await execa('git', [
    'rev-parse',
    '--show-toplevel'
  ], {
    cwd: cwd.get()
  })
  return stdout
}

async function resolveFile (file, context) {
  const root = await getRoot(context)
  return path.resolve(root, file)
}

module.exports = {
  getDiffs,
  commit,
  reset,
  getRoot,
  resolveFile
}
