const path = require('path')
const fs = require('fs-extra')
const parseDiff = require('../util/parse-diff')
// Connectors
const cwd = require('./cwd')
// Utils
const { execa, hasProjectGit } = require('@vue/cli-shared-utils')

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

  const { highlightCode } = require('../util/highlight')

  const newFiles = await getNewFiles(context)
  await execa('git', ['add', '-N', '*'], {
    cwd: cwd.get()
  })
  const { stdout } = await execa('git', ['diff'], {
    cwd: cwd.get()
  })
  await reset(context)
  let list = parseDiff(stdout)
  for (const n in list) {
    const fileDiff = list[n]
    const isNew = newFiles.includes(fileDiff.to)
    let fromContent
    if (!isNew) {
      const result = await execa('git', ['show', `HEAD:${fileDiff.from}`], {
        cwd: cwd.get()
      })
      fromContent = result.stdout
    }
    const highlightedContentFrom = fromContent && highlightCode(fileDiff.from, fromContent).split('\n')
    const highlightedContentTo = highlightCode(fileDiff.to, fs.readFileSync(path.resolve(cwd.get(), fileDiff.to), { encoding: 'utf8' })).split('\n')
    for (const chunk of fileDiff.chunks) {
      for (const change of chunk.changes) {
        const firstChar = change.content.charAt(0)
        let highlightedCode
        if (change.normal) {
          highlightedCode = highlightedContentFrom[change.ln1 - 1]
        } else if (change.type === 'del') {
          highlightedCode = highlightedContentFrom[change.ln - 1]
        } else if (change.type === 'add') {
          highlightedCode = highlightedContentTo[change.ln - 1]
        }
        if (highlightedCode) {
          change.content = firstChar + highlightedCode
        }
      }
    }
    list[n] = {
      id: fileDiff.index.join(' '),
      ...fileDiff,
      new: isNew
    }
  }

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
