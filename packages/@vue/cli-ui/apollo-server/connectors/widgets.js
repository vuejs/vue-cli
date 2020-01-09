const shortid = require('shortid')
// Connectors
const cwd = require('./cwd')
const prompts = require('./prompts')
// Utils
const { log } = require('../util/logger')

function getDefaultWidgets () {
  return [
    {
      id: shortid(),
      definitionId: 'org.vue.widgets.welcome',
      x: 0,
      y: 0,
      width: 3,
      height: 4,
      configured: true,
      config: null
    },
    {
      id: shortid(),
      definitionId: 'org.vue.widgets.kill-port',
      x: 3,
      y: 0,
      width: 2,
      height: 1,
      configured: true,
      config: null
    }
  ]
}

let widgetDefs = new Map()
let widgetCount = new Map()
let widgets = []
let currentWidget

let loadPromise, loadResolve

function reset (context) {
  widgetDefs = new Map()
  widgetCount = new Map()
  widgets = []
  loadPromise = new Promise((resolve) => {
    loadResolve = () => {
      loadPromise = null
      resolve()
      log('Load Promise resolved')
    }
  })
}

async function registerDefinition ({ definition, project }, context) {
  definition.hasConfigPrompts = !!definition.onConfigOpen

  // Default icon
  if (!definition.icon) {
    const plugins = require('./plugins')
    const plugin = plugins.findOne({ id: definition.pluginId, file: cwd.get() }, context)
    const logo = await plugins.getLogo(plugin, context)
    if (logo) {
      definition.icon = `${logo}?project=${project.id}`
    }
  }

  widgetDefs.set(definition.id, definition)
}

function listDefinitions (context) {
  return widgetDefs.values()
}

function findDefinition ({ definitionId }, context) {
  const def = widgetDefs.get(definitionId)
  if (!def) {
    throw new Error(`Widget definition ${definitionId} not found`)
  }
  return def
}

async function list (context) {
  log('loadPromise', loadPromise)
  if (loadPromise) {
    await loadPromise
  }
  log('widgets', widgets)
  return widgets
}

function load (context) {
  const projects = require('./projects')
  const id = projects.getCurrent(context).id
  const project = context.db.get('projects').find({ id }).value()
  widgets = project.widgets

  if (!widgets) {
    widgets = getDefaultWidgets()
  }

  widgets.forEach(widget => {
    updateCount(widget.definitionId, 1)
  })

  log('Widgets loaded', widgets.length)

  loadResolve()
}

function save (context) {
  const projects = require('./projects')
  const id = projects.getCurrent(context).id
  context.db.get('projects').find({ id }).assign({
    widgets
  }).write()
}

function canAddMore (definition, context) {
  if (definition.maxCount) {
    return getCount(definition.id) < definition.maxCount
  }
  return true
}

function add ({ definitionId }, context) {
  const definition = findDefinition({ definitionId }, context)

  const { x, y, width, height } = findValidPosition(definition)

  const widget = {
    id: shortid(),
    definitionId,
    x,
    y,
    width,
    height,
    config: null,
    configured: !definition.needsUserConfig
  }

  // Default config
  if (definition.defaultConfig) {
    widget.config = definition.defaultConfig({
      definition
    })
  }

  updateCount(definitionId, 1)
  widgets.push(widget)
  save(context)

  if (definition.onAdded) {
    definition.onAdded({ widget, definition })
  }

  return widget
}

function getCount (definitionId) {
  if (widgetCount.has(definitionId)) {
    return widgetCount.get(definitionId)
  } else {
    return 0
  }
}

function updateCount (definitionId, mod) {
  widgetCount.set(definitionId, getCount(definitionId) + mod)
}

function findValidPosition (definition, currentWidget = null) {
  // Find next available space
  const width = (currentWidget && currentWidget.width) || definition.defaultWidth || definition.minWidth
  const height = (currentWidget && currentWidget.height) || definition.defaultHeight || definition.minHeight
  // Mark occupied positions on the grid
  const grid = new Map()
  for (const widget of widgets) {
    if (widget !== currentWidget) {
      for (let x = widget.x; x < widget.x + widget.width; x++) {
        for (let y = widget.y; y < widget.y + widget.height; y++) {
          grid.set(`${x}:${y}`, true)
        }
      }
    }
  }
  // Go through the possible positions
  let x = 0
  let y = 0
  while (true) {
    // Virtual "line brak"
    if (x !== 0 && x + width >= 7) {
      x = 0
      y++
    }
    const { result, testX } = hasEnoughSpace(grid, x, y, width, height)
    if (!result) {
      x = testX + 1
      continue
    }
    // Found! :)
    break
  }

  return {
    x,
    y,
    width,
    height
  }
}

function hasEnoughSpace (grid, x, y, width, height) {
  // Test if enough horizontal available space
  for (let testX = x; testX < x + width; testX++) {
    // Test if enough vertical available space
    for (let testY = y; testY < y + height; testY++) {
      if (grid.get(`${testX}:${testY}`)) {
        return { result: false, testX }
      }
    }
  }
  return { result: true }
}

function findById ({ id }, context) {
  return widgets.find(w => w.id === id)
}

function remove ({ id }, context) {
  const index = widgets.findIndex(w => w.id === id)
  if (index !== -1) {
    const widget = widgets[index]
    updateCount(widget.definitionId, -1)
    widgets.splice(index, 1)
    save(context)

    const definition = findDefinition(widget, context)
    if (definition.onAdded) {
      definition.onAdded({ widget, definition })
    }

    return widget
  }
}

function move (input, context) {
  const widget = findById(input, context)
  if (widget) {
    widget.x = input.x
    widget.y = input.y
    const definition = findDefinition(widget, context)
    widget.width = input.width
    widget.height = input.height
    if (widget.width < definition.minWidth) widget.width = definition.minWidth
    if (widget.width > definition.maxWidth) widget.width = definition.maxWidth
    if (widget.height < definition.minHeight) widget.height = definition.minHeight
    if (widget.height > definition.maxHeight) widget.height = definition.maxHeight

    for (const otherWidget of widgets) {
      if (otherWidget !== widget) {
        if (areOverlapping(otherWidget, widget)) {
          const otherDefinition = findDefinition(otherWidget, context)
          Object.assign(otherWidget, findValidPosition(otherDefinition, otherWidget))
        }
      }
    }

    save(context)
  }
  return widgets
}

function areOverlapping (widgetA, widgetB) {
  return (
    widgetA.x + widgetA.width - 1 >= widgetB.x &&
    widgetA.x <= widgetB.x + widgetB.width - 1 &&
    widgetA.y + widgetA.height - 1 >= widgetB.y &&
    widgetA.y <= widgetB.y + widgetB.height - 1
  )
}

async function openConfig ({ id }, context) {
  const widget = findById({ id }, context)
  const definition = findDefinition(widget, context)
  if (definition.onConfigOpen) {
    const result = await definition.onConfigOpen({
      widget,
      definition,
      context
    })
    await prompts.reset(widget.config || {})
    result.prompts.forEach(prompts.add)
    await prompts.start()
    currentWidget = widget
  }
  return widget
}

function getConfigPrompts ({ id }, context) {
  return currentWidget && currentWidget.id === id ? prompts.list() : []
}

function saveConfig ({ id }, context) {
  const widget = findById({ id }, context)
  widget.config = prompts.getAnswers()
  widget.configured = true
  save(context)
  currentWidget = null
  return widget
}

function resetConfig ({ id }, context) {
  // const widget = findById({ id }, context)
  // TODO
  save(context)
}

module.exports = {
  reset,
  registerDefinition,
  listDefinitions,
  findDefinition,
  list,
  load,
  save,
  canAddMore,
  getCount,
  add,
  remove,
  move,
  openConfig,
  getConfigPrompts,
  saveConfig,
  resetConfig
}
