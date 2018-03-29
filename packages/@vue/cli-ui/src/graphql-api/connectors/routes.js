const BUILTIN_ROUTES = [
  {
    id: 'project-plugins',
    name: 'project-plugins',
    icon: 'widgets',
    tooltip: 'components.project-nav.tooltips.plugins'
  },
  {
    id: 'project-configurations',
    name: 'project-configurations',
    icon: 'settings_applications',
    tooltip: 'components.project-nav.tooltips.configuration'
  },
  {
    id: 'project-tasks',
    name: 'project-tasks',
    icon: 'assignment',
    tooltip: 'components.project-nav.tooltips.tasks'
  }
]

let routes = [
  ...BUILTIN_ROUTES
]

function list (context) {
  return routes
}

module.exports = {
  list
}
