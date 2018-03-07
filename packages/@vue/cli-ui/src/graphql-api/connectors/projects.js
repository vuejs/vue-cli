const Creator = require('@vue/cli/lib/Creator')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { getFeatures } = require('@vue/cli/lib/util/features')
const { toShortPluginId } = require('@vue/cli-shared-utils')
const cwd = require('./cwd')
const prompts = require('./prompts')

let currentProject = null
let creator = null
let presets = []
let features = []

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

function initCreator () {
  const creator = new Creator('', cwd.get(), getPromptModules())

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
      id: 'manual',
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

  return creator
}

function getCreation (context) {
  if (!creator) {
    creator = initCreator()
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

module.exports = {
  list,
  getCurrent,
  getCreation,
  applyPreset,
  setFeatureEnabled,
  answerPrompt
}
