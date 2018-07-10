// Connectors
const cwd = require('./cwd')
// Subs
const channels = require('../channels')

let currentView

function createViewsSet () {
  // Builtin views
  return [
    {
      id: 'vue-project-plugins',
      name: 'project-plugins',
      icon: 'extension',
      tooltip: 'org.vue.components.project-nav.tooltips.plugins'
    },
    {
      id: 'vue-project-dependencies',
      name: 'project-dependencies',
      icon: 'widgets',
      tooltip: 'org.vue.components.project-nav.tooltips.dependencies',
      projectTypes: ['vue', 'unknown']
    },
    {
      id: 'vue-project-configurations',
      name: 'project-configurations',
      icon: 'settings_applications',
      tooltip: 'org.vue.components.project-nav.tooltips.configuration'
    },
    {
      id: 'vue-project-tasks',
      name: 'project-tasks',
      icon: 'assignment',
      tooltip: 'org.vue.components.project-nav.tooltips.tasks',
      projectTypes: ['vue', 'unknown']
    }
  ]
}

const viewsMap = new Map()

function getViews () {
  const file = cwd.get()
  let list = viewsMap.get(file)
  if (!list) {
    list = createViewsSet()
    viewsMap.set(file, list)
  }
  return list
}

function list (context) {
  return getViews()
}

function findOne (id) {
  const views = getViews()
  return views.find(r => r.id === id)
}

function add (view, context) {
  remove(view.id, context)
  const views = getViews()
  views.push(view)
  context.pubsub.publish(channels.VIEW_ADDED, {
    viewAdded: view
  })
}

function remove (id, context) {
  const views = getViews()
  const index = views.findIndex(r => r.id === id)
  if (index !== -1) {
    const view = views[index]
    views.splice(index, 1)
    context.pubsub.publish(channels.VIEW_REMOVED, {
      viewRemoved: view
    })
  }
}

function update (view, context) {
  const existingView = findOne(view.id)
  if (existingView) {
    Object.assign(existingView, view)
    context.pubsub.publish(channels.VIEW_CHANGED, {
      viewChanged: existingView
    })
  }
}

function addBadge ({ viewId, badge }, context) {
  const view = findOne(viewId)
  if (view) {
    if (!view.badges) view.badges = []
    const existingBadge = view.badges.find(b => b.id === badge.id)
    if (existingBadge) {
      Object.assign(existingBadge, badge, {
        count: existingBadge.count + 1
      })
    } else {
      view.badges.push({
        type: 'dim',
        count: 1,
        priority: 0,
        hidden: false,
        ...badge
      })
    }
    update(view, context)
  }
}

function removeBadge ({ viewId, badgeId }, context) {
  const view = findOne(viewId)
  if (view && view.badges) {
    const existingBadge = view.badges.find(b => b.id === badgeId)
    if (existingBadge) {
      existingBadge.count--
      if (existingBadge.count <= 0) {
        const index = view.badges.indexOf(existingBadge)
        index !== -1 && view.badges.splice(index, 1)
      }
      update(view, context)
    }
  }
}

function open (id, context) {
  const view = findOne(id)
  currentView = view
  const plugins = require('./plugins')
  plugins.callHook({
    id: 'viewOpen',
    args: [{
      view,
      cwd: cwd.get()
    }],
    file: cwd.get()
  }, context)
  return true
}

module.exports = {
  list,
  findOne,
  add,
  remove,
  update,
  addBadge,
  removeBadge,
  open,
  getCurrent: () => currentView
}
