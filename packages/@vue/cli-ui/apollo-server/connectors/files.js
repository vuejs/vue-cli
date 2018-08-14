const { launch } = require('@vue/cli-shared-utils')
const path = require('path')
// Connectors
const cwd = require('./cwd')
const git = require('./git')
const logs = require('./logs')

async function openInEditor (input, context) {
  let query
  if (input.gitPath) {
    query = await git.resolveFile(input.file, context)
  } else {
    query = path.resolve(cwd.get(), input.file)
  }
  if (input.line) {
    query += `:${input.line}`
    if (input.column) {
      query += `:${input.column}`
    }
  }
  logs.add({
    message: `Opening file '${query}' in code editor...`,
    type: 'info'
  }, context)
  launch(query)
  return true
}

module.exports = {
  openInEditor
}
