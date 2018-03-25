const path = require('path')
const fs = require('fs')
const shortId = require('shortid')
const Creator = require('@vue/cli/lib/Creator')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { getFeatures } = require('@vue/cli/lib/util/features')
const { defaults } = require('@vue/cli/lib/options')
const { toShortPluginId } = require('@vue/cli-shared-utils')
const { progress: installProgress } = require('@vue/cli/lib/util/installDeps')
// Connectors
const progress = require('./progress')
const cwd = require('./cwd')
const prompts = require('./prompts')
const folders = require('./folders')
const plugins = require('./plugins')

const PROGRESS_ID = 'project-create'

let currentProject = null
let creator = null
let presets = []
let features = []
let onCreationEvent = null
let onInstallProgress = null
let onInstallLog = null

function list (context) {
  return context.db.get('projects').value()
}

function getCurrent (context) {
  return currentProject
}

function generatePresetDescription (preset) {
  let description = `Features: ${preset.features.join(', ')}`
  if (preset.raw.useConfigFiles) {
    description += ` (Use config files)`
  }
  return description
}

function generateProjectCreation (creator) {
  return {
    presets,
    features,
    prompts: prompts.list()
  }
}

function initCreator (context) {
  const creator = new Creator('', cwd.get(), getPromptModules())

  /* Event listeners */
  // Creator emits creation events (the project creation steps)
  onCreationEvent = ({ event }) => {
    progress.set({ id: PROGRESS_ID, status: event, info: null }, context)
  }
  creator.on('creation', onCreationEvent)
  // Progress bar
  onInstallProgress = value => {
    if (progress.get(PROGRESS_ID)) {
      progress.set({ id: PROGRESS_ID, progress: value }, context)
    }
  }
  installProgress.on('progress', onInstallProgress)
  // Package manager steps
  onInstallLog = message => {
    if (progress.get(PROGRESS_ID)) {
      progress.set({ id: PROGRESS_ID, info: message }, context)
    }
  }
  installProgress.on('log', onInstallLog)

  // Presets
  const presetsData = creator.getPresets()
  presets = [
    ...Object.keys(presetsData).map(
      key => {
        const preset = presetsData[key]
        const features = getFeatures(preset).map(
          f => toShortPluginId(f)
        )
        const info = {
          id: key,
          name: key === 'default' ? 'Default preset' : key,
          features,
          link: null,
          raw: preset
        }
        info.description = generatePresetDescription(info)
        return info
      }
    ),
    {
      id: '__manual__',
      name: 'Manual',
      description: 'Manually select features',
      link: null,
      features: []
    }
  ]

  // Features
  const featuresData = creator.featurePrompt.choices
  features = [
    ...featuresData.map(
      data => ({
        id: data.value,
        name: data.name,
        description: data.description || null,
        link: data.link || null,
        plugins: data.plugins || null,
        enabled: false
      })
    ),
    {
      id: 'use-config-files',
      name: 'Use config files',
      description: `Use specific configuration files (like '.babelrc') instead of using 'package.json'.`,
      link: null,
      plugins: null,
      enabled: false
    }
  ]

  // Prompts
  prompts.reset()
  creator.injectedPrompts.forEach(prompts.add)
  updatePromptsFeatures()
  prompts.start()

  return creator
}

function removeCreator (context) {
  if (creator) {
    creator.removeListener('creation', onCreationEvent)
    installProgress.removeListener('progress', onInstallProgress)
    installProgress.removeListener('log', onInstallLog)
    creator = null
  }
}

function getCreation (context) {
  if (!creator) {
    creator = initCreator(context)
  }
  return generateProjectCreation(creator)
}

function updatePromptsFeatures () {
  prompts.changeAnswers(answers => {
    answers.features = features.filter(
      f => f.enabled
    ).map(
      f => f.id
    )
  })
}

function setFeatureEnabled ({ id, enabled, updatePrompts = true }, context) {
  const feature = features.find(f => f.id === id)
  if (feature) {
    feature.enabled = enabled
  } else {
    console.warn(`Feature '${id}' not found`)
  }
  if (updatePrompts) updatePromptsFeatures()
  return feature
}

function applyPreset (id, context) {
  const preset = presets.find(p => p.id === id)
  if (preset) {
    for (const feature of features) {
      feature.enabled = !!(
        preset.features.includes(feature.id) ||
        (feature.plugins && preset.features.some(f => feature.plugins.includes(f)))
      )
    }
    if (preset.raw) {
      if (preset.raw.router) {
        setFeatureEnabled({ id: 'router', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.vuex) {
        setFeatureEnabled({ id: 'vuex', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.cssPreprocessor) {
        setFeatureEnabled({ id: 'css-preprocessor', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.useConfigFiles) {
        setFeatureEnabled({ id: 'use-config-files', enabled: true, updatePrompts: false }, context)
      }
    }
    updatePromptsFeatures()
  } else {
    console.warn(`Preset '${id}' not found`)
  }

  return generateProjectCreation(creator)
}

function answerPrompt ({ id, value }, context) {
  prompts.setValue({ id, value: JSON.parse(value) })
  return prompts.list()
}

async function create (input, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'creating'
    })

    const targetDir = path.join(cwd.get(), input.folder)
    creator.context = targetDir

    const inCurrent = input.folder === '.'
    const name = inCurrent ? path.relative('../', process.cwd()) : input.folder
    creator.name = name

    // Delete existing folder
    if (fs.existsSync(targetDir)) {
      if (input.force) {
        setProgress({
          info: 'Cleaning folder...'
        })
        await folders.delete(targetDir)
        setProgress({
          info: null
        })
      } else {
        throw new Error(`Folder ${targetDir} already exists`)
      }
    }

    // Answers
    const answers = prompts.getAnswers()
    prompts.reset()
    let index

    // Package Manager
    answers.packageManager = input.packageManager

    // Config files
    if ((index = answers.features.includes('use-config-files')) !== -1) {
      answers.features.splice(index, 1)
      answers.useConfigFiles = 'files'
    }

    // Preset
    answers.preset = input.preset
    if (input.save) {
      answers.save = true
      answers.saveName = input.save
    }

    setProgress({
      info: 'Resolving preset...'
    })
    let preset
    if (input.remote) {
      // vue create foo --preset bar
      preset = await creator.resolvePreset(input.preset, input.clone)
    } else if (input.preset === 'default') {
      // vue create foo --default
      preset = defaults.presets.default
    } else {
      preset = await creator.promptAndResolvePreset(answers)
    }
    setProgress({
      info: null
    })

    // Create
    await creator.create({}, preset)
    removeCreator()

    return importProject({
      path: targetDir
    }, context)
  })
}

async function importProject (input, context) {
  const project = {
    id: shortId.generate(),
    path: input.path,
    favorite: 0
  }
  const packageData = folders.readPackage(project.path, context)
  project.name = packageData.name
  context.db.get('projects').push(project).write()
  return open(project.id, context)
}

async function open (id, context) {
  const project = context.db.get('projects').find({
    id
  }).value()

  if (!project) {
    throw new Error(`Project '${id}' not found`)
  }

  currentProject = project
  cwd.set(project.path, context)
  // Load plugins
  plugins.list(project.path, context)

  return project
}

async function remove (id, context) {
  if (currentProject && currentProject.id === id) {
    currentProject = null
  }
  context.db.get('projects').remove({ id }).write()
  return true
}

function resetCwd (context) {
  if (currentProject) {
    cwd.set(currentProject.path, context)
  }
}

function findOne (id, context) {
  return context.db.get('projects').find({ id }).value()
}

function setFavorite ({ id, favorite }, context) {
  context.db.get('projects').find({ id }).assign({ favorite }).write()
  return findOne(id, context)
}

module.exports = {
  list,
  getCurrent,
  getCreation,
  applyPreset,
  setFeatureEnabled,
  answerPrompt,
  create,
  import: importProject,
  open,
  remove,
  resetCwd,
  setFavorite
}
