const Creator = require('@vue/cli/lib/Creator')
const { getPromptModules } = require('@vue/cli/lib/util/createTools')
const { getFeatures } = require('@vue/cli/lib/util/features')
const { toShortPluginId } = require('@vue/cli-shared-utils')
const cwd = require('./cwd')

let currentProject = null
let creator = null

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
  const presets = creator.getPresets()
  return {
    presets: [
      ...Object.keys(presets).map(
        key => {
          const preset = presets[key]
          const features = getFeatures(preset).map(
            f => toShortPluginId(f)
          )
          const info = {
            id: key,
            name: key === 'default' ? 'Default preset' : key,
            features,
            raw: preset
          }
          info.description = generatePresetDescription(info)
          return info
        }
      ),
      {
        id: 'manual',
        name: 'No preset',
        description: 'No included features',
        features: []
      }
    ]
  }
}

function getCreation (context) {
  if (!creator) {
    creator = new Creator('', cwd.get(), getPromptModules())
  }
  return generateProjectCreation(creator)
}

module.exports = {
  list,
  getCurrent,
  getCreation
}
