let currentProject = null

function list (context) {
  return context.db.get('projects').value()
}

function getCurrent (context) {
  return currentProject
}

module.exports = {
  list,
  getCurrent
}
