const cwd = require('./cwd')
const folders = require('./folders')

let tasks = []

function list (context) {
  const file = cwd.get()
  const pkg = folders.readPackage(file, context)
  tasks = []
  if (pkg.scripts) {
    tasks = Object.keys(pkg.scripts).map(
      name => ({
        id: `${file}:${name}`,
        name,
        command: pkg.scripts[name],
        status: 'idle'
      })
    )
  }
  return tasks
}

function findOne (id, context) {
  return tasks.find(
    t => t.id === id
  )
}

module.exports = {
  list,
  findOne
}
