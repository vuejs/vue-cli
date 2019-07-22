const { getPromptModules } = require('@vue/cli-global-utils/lib/util/createTools')
const PromptModuleAPI = require('@vue/cli-global-utils/lib/PromptModuleAPI')
const { getPresets } = require('@vue/cli-global-utils/lib/util/getPresets')
const { getFeatures } = require('@vue/cli-global-utils/lib/util/features')
const {
  toShortPluginId,
  isPlugin,
  isOfficialPlugin,
  getPluginLink
} = require('@vue/cli-shared-utils')
const { createProject } = require('./create-project')

const CLI_SERVICE = '@vue/cli-service'

module.exports = api => {
  api.addProjectType('vue', 'Vue CLI', projectType => {
    projectType.logo = '/_plugin/@vue%2Fcli-guijs-plugin/vue-project.png'

    // Detect Vue CLI project
    projectType.filterProject = ({ pkg }) => ({ ...pkg.dependencies, ...pkg.devDependencies })['@vue/cli-service']

    // Project creation
    projectType.onCreate(onCreate)

    // Plugins
    projectType.hasPlugins(config => {
      config.filterPlugin = ({ pkg }) => isPlugin(pkg.name) || pkg.name === CLI_SERVICE
      config.isOfficial = ({ pkg }) => isOfficialPlugin(pkg.name) || pkg.name === CLI_SERVICE
      config.getLink = ({ pkg }) => {
        if (pkg.name === CLI_SERVICE) {
          return 'https://cli.vuejs.org/'
        }
        return getPluginLink(pkg.name)
      }
    })
  })
}

function onCreate ({ wizard }) {
  const promptModules = getPromptModules()
  const promptAPI = new PromptModuleAPI()
  promptModules.forEach(m => m(promptAPI))
  const promptCompleteCbs = promptAPI.promptCompleteCbs

  wizard.extendGeneralStep({
    prompts: [
      {
        name: 'force',
        type: 'confirm',
        message: 'Overwrite target directory if it exists'
      },
      {
        name: 'bare',
        type: 'confirm',
        message: 'Scaffold project without beginner instructions'
      },
      {
        name: 'packageManager',
        type: 'list',
        message: 'Package manager',
        group: 'Dependencies',
        description: 'Use specified npm client when installing dependencies',
        default: null,
        choices: [
          {
            name: 'Use previous',
            value: null
          },
          {
            name: 'Npm',
            value: 'npm'
          },
          {
            name: 'Yarn',
            value: 'yarn'
          },
          {
            name: 'Pnpm',
            value: 'pnpm'
          }
        ],
        skin: 'buttongroup'
      },
      {
        name: 'registryUrl',
        type: 'input',
        message: 'Registry URL',
        group: 'Dependencies',
        description: 'Use specified npm registry when installing dependencies'
      },
      {
        name: 'proxy',
        type: 'input',
        message: 'Proxy',
        group: 'Dependencies',
        description: 'Use specified proxy when creating project'
      },
      {
        name: 'useGit',
        type: 'confirm',
        message: 'Initialize git repository (recommended)',
        group: 'Git',
        default: true
      },
      {
        name: 'commitMessage',
        type: 'input',
        message: 'First commit message',
        group: 'Git',
        when: answers => answers.useGit
      }
    ]
  })

  // Presets
  const presetsData = getPresets()
  wizard.addSelectStep('preset', 'org.vue.views.project-create.tabs.presets.title', {
    icon: 'check_circle',
    description: 'org.vue.views.project-create.tabs.presets.description',
    message: 'org.vue.views.project-create.tabs.presets.message',
    choices: [
      ...Object.keys(presetsData).map(key => {
        const preset = presetsData[key]
        const features = getFeatures(preset).map(
          f => toShortPluginId(f)
        )
        const info = {
          name: key === 'default' ? 'org.vue.views.project-create.tabs.presets.default-preset' : key,
          value: key,
          features,
          raw: preset
        }
        info.description = generatePresetDescription(info)
        return info
      }),
      {
        name: 'org.vue.views.project-create.tabs.presets.manual.name',
        value: '__manual__',
        description: 'org.vue.views.project-create.tabs.presets.manual.description',
        features: promptAPI.features.filter(
          f => f.checked
        ).map(
          f => f.value
        )
      },
      {
        name: 'org.vue.views.project-create.tabs.presets.remote.name',
        value: '__remote__',
        description: 'org.vue.views.project-create.tabs.presets.remote.description',
        features: []
      }
    ]
  })

  const isManualPreset = answers => answers.preset && answers.preset === '__manual__'

  // Features
  wizard.addStep('features', 'org.vue.views.project-create.tabs.features.title', {
    icon: 'device_hub',
    description: 'org.vue.views.project-create.tabs.features.description',
    prompts: promptAPI.features.map(
      data => ({
        name: `featureMap.${data.value}`,
        type: 'confirm',
        message: data.name,
        description: data.description,
        link: data.link,
        default: !!data.checked
      })
    )
  }, isManualPreset)

  // Additional configuration
  wizard.addStep('config', 'org.vue.views.project-create.tabs.configuration.title', {
    icon: 'settings_applications',
    prompts: [
      {
        name: 'useConfigFiles',
        type: 'confirm',
        message: 'org.vue.views.project-create.tabs.features.userConfigFiles.name',
        description: 'org.vue.views.project-create.tabs.features.userConfigFiles.description'
      },
      ...promptAPI.injectedPrompts.map(prompt => ({
        ...prompt,
        when: withAnswers(prompt.when, () => ({
          features: getFeatureList(wizard.answers.featureMap)
        })),
        choices: withAnswers(prompt.choices, () => ({
          features: getFeatureList(wizard.answers.featureMap)
        })),
        default: withAnswers(prompt.default, () => ({
          features: getFeatureList(wizard.answers.featureMap)
        }))
      }))
    ]
  }, isManualPreset)

  // Save preset modal
  wizard.addModalStep('savePreset', 'org.vue.views.project-create.tabs.configuration.modal.title', {
    prompts: [
      {
        name: 'presetName',
        type: 'input',
        message: 'org.vue.views.project-create.tabs.configuration.modal.body.title',
        description: 'org.vue.views.project-create.tabs.configuration.modal.body.subtitle',
        validate: value => !!value
      }
    ],
    canSkip: true
  }, isManualPreset)

  // Submit
  wizard.onSubmit(options => createProject({
    ...options,
    answers: {
      ...options.answers,
      features: getFeatureList(options.answers.featureMap)
    }
  }, promptCompleteCbs))
}

function generatePresetDescription (presetChoice) {
  let description = presetChoice.features.join(', ')
  if (presetChoice.raw.useConfigFiles) {
    description += ` (Use config files)`
  }
  return description
}

function getFeatureList (answers) {
  if (answers == null) return []
  return Object.keys(answers).filter(key => answers[key])
}

function withAnswers (option, overrides) {
  if (typeof option === 'function') {
    return (answers) => option({
      ...answers,
      ...overrides()
    })
  } else {
    return option
  }
}
