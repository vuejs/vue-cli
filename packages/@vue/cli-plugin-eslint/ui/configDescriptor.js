const CONFIG = 'org.vue.eslintrc'

const CATEGORIES = [
  'essential',
  'strongly-recommended',
  'recommended',
  'uncategorized'
]

const DEFAULT_CATEGORY = 'essential'
const RULE_SETTING_OFF = 'off'
const RULE_SETTING_ERROR = 'error'
const RULE_SETTING_WARNING = 'warning'
const RULE_SETTINGS = [RULE_SETTING_OFF, RULE_SETTING_ERROR, RULE_SETTING_WARNING]

const defaultChoices = [
  {
    name: 'org.vue.eslint.config.eslint.setting.off',
    value: JSON.stringify(RULE_SETTING_OFF)
  },
  {
    name: 'org.vue.eslint.config.eslint.setting.error',
    value: JSON.stringify(RULE_SETTING_ERROR)
  },
  {
    name: 'org.vue.eslint.config.eslint.setting.warning',
    value: JSON.stringify(RULE_SETTING_WARNING)
  }
]

function escapeHTML (text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function getEslintConfigName (eslint) {
  let config = eslint.extends

  if (eslint.extends instanceof Array) {
    config = eslint.extends.find(configName => configName.startsWith('plugin:vue/'))
  }

  return config && config.startsWith('plugin:vue/') ? config : null
}

// Sets default value regarding selected global config
function getDefaultValue (rule, data) {
  const { category: ruleCategory } = rule.meta.docs
  const currentCategory = getEslintConfigName(data.eslint)

  if (!currentCategory || ruleCategory === undefined) return RULE_SETTING_OFF

  return CATEGORIES.indexOf(ruleCategory) <= CATEGORIES.indexOf(currentCategory.split('/')[1])
    ? RULE_SETTING_ERROR
    : RULE_SETTING_OFF
}

function getEslintPrompts (data, rules) {
  const allRules = Object.keys(rules)
    .map(ruleKey => ({
      ...rules[ruleKey],
      name: `vue/${ruleKey}`
    }))

  return CATEGORIES
    .map(category =>
      allRules.filter(rule =>
        rule.meta.docs.category === category || (
          category === 'uncategorized' &&
          rule.meta.docs.category === undefined
        )
      )
    )
    .reduce((acc, rulesArr) => [...acc, ...rulesArr], [])
    .map(rule => {
      const value = data.eslint &&
        data.eslint.rules &&
        data.eslint.rules[rule.name]

      return {
        name: rule.name,
        type: 'list',
        message: rule.name,
        group: `org.vue.eslint.config.eslint.groups.${rule.meta.docs.category || 'uncategorized'}`,
        description: escapeHTML(rule.meta.docs.description),
        link: rule.meta.docs.url,
        default: JSON.stringify(getDefaultValue(rule, data)),
        value: JSON.stringify(value),
        choices: !value || RULE_SETTINGS.indexOf(value) > -1
          ? defaultChoices
          : [...defaultChoices, {
            name: 'org.vue.eslint.config.eslint.setting.custom',
            value: JSON.stringify(value)
          }]
      }
    })
}

function onRead ({ data, cwd }) {
  const { loadModule } = require('@vue/cli-shared-utils')
  const rules = loadModule('eslint-plugin-vue', cwd, true).rules

  return {
    tabs: [
      {
        id: 'general',
        label: 'org.vue.eslint.config.eslint.general.label',
        prompts: [
          {
            name: 'lintOnSave',
            type: 'confirm',
            message: 'org.vue.eslint.config.eslint.general.lintOnSave.message',
            description: 'org.vue.eslint.config.eslint.general.lintOnSave.description',
            link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#configuration',
            default: true,
            value: data.vue && data.vue.lintOnSave
          },
          {
            name: 'config',
            type: 'list',
            message: 'org.vue.eslint.config.eslint.general.config.message',
            description: 'org.vue.eslint.config.eslint.general.config.description',
            link: 'https://github.com/vuejs/eslint-plugin-vue',
            default: `plugin:vue/${DEFAULT_CATEGORY}`,
            choices: CATEGORIES.filter(category => category !== 'uncategorized').map(category => ({
              name: `org.vue.eslint.config.eslint.groups.${category}`,
              value: `plugin:vue/${category}`
            })),
            value: getEslintConfigName(data.eslint)
          }
        ]
      },
      {
        id: 'rules',
        label: 'org.vue.eslint.config.eslint.rules.label',
        prompts: getEslintPrompts(data, rules)
      }
    ]
  }
}

async function onWrite ({ data, api, prompts }) {
  const eslintData = { ...data.eslint }
  const vueData = {}
  for (const prompt of prompts) {
    // eslintrc
    if (prompt.id === 'config') {
      if (eslintData.extends instanceof Array) {
        const vueEslintConfig = eslintData.extends.find(config => config.indexOf('plugin:vue/') === 0)
        const index = eslintData.extends.indexOf(vueEslintConfig)
        eslintData.extends[index] = JSON.parse(prompt.value)
      } else {
        eslintData.extends = JSON.parse(prompt.value)
      }
    } else if (prompt.id.indexOf('vue/') === 0) {
      eslintData[`rules.${prompt.id}`] = await api.getAnswer(prompt.id, JSON.parse)
    } else {
      // vue.config.js
      vueData[prompt.id] = await api.getAnswer(prompt.id)
    }
  }
  api.setData('eslint', eslintData)
  api.setData('vue', vueData)
}

const config = {
  id: CONFIG,
  name: 'ESLint configuration',
  description: 'org.vue.eslint.config.eslint.description',
  link: 'https://github.com/vuejs/eslint-plugin-vue',
  files: {
    eslint: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      yaml: ['.eslintrc.yaml', '.eslintrc.yml'],
      package: 'eslintConfig'
    },
    vue: {
      js: ['vue.config.js']
    }
  },
  onRead,
  onWrite
}

module.exports = {
  config,
  getEslintConfigName,
  getDefaultValue,
  getEslintPrompts
}
