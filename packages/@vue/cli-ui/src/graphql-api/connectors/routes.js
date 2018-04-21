// Subs
const channels = require('../channels')

const BUILTIN_ROUTES = [
  {
    id: 'vue-project-plugins',
    name: 'project-plugins',
    icon: 'widgets',
    tooltip: 'components.project-nav.tooltips.plugins'
  },
  {
    id: 'vue-project-configurations',
    name: 'project-configurations',
    icon: 'settings_applications',
    tooltip: 'components.project-nav.tooltips.configuration'
  },
  {
    id: 'vue-project-tasks',
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

function findOne (id) {
  return routes.find(r => r.id === id)
}

function add (route, context) {
  routes.push(route)
  context.pubsub.publish(channels.ROUTE_ADDED, {
    routeAdded: route
  })
}

function remove (id, context) {
  const index = routes.findIndex(r => r.id === id)
  if (index !== -1) {
    const route = routes[index]
    routes.splice(index, 1)
    context.pubsub.publish(channels.ROUTE_REMOVED, {
      routeRemoved: route
    })
  }
}

function update (route, context) {
  const existingRoute = findOne(route.id)
  if (existingRoute) {
    Object.assign(existingRoute, route)
    context.pubsub.publish(channels.ROUTE_CHANGED, {
      routeChanged: existingRoute
    })
  }
}

function addBadge ({ routeId, badge }, context) {
  const route = findOne(routeId)
  if (route) {
    if (!route.badges) route.badges = []
    const existingBadge = route.badges.find(b => b.id === badge.id)
    if (existingBadge) {
      Object.assign(existingBadge, badge, {
        count: existingBadge.count + (badge.count || 1)
      })
    } else {
      route.badges.push({
        type: 'dim',
        count: (badge.count || 1),
        priority: 0,
        hidden: false,
        ...badge
      })
    }
    update(route, context)
  }
}

function removeBadge ({ routeId, badgeId }, context) {
  const route = findOne(routeId)
  if (route && route.badges) {
    const existingBadge = route.badges.find(b => b.id === badgeId)
    if (existingBadge) {
      existingBadge.count--
      if (existingBadge.count <= 0) {
        const index = route.badges.indexOf(existingBadge)
        index !== -1 && route.badges.splice(index, 1)
      }
      update(route, context)
    }
  }
}

module.exports = {
  list,
  findOne,
  add,
  remove,
  update,
  addBadge,
  removeBadge
}
