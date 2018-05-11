module.exports = api => {
  // Config file
  api.describeConfig({
    id: 'eslintrc',
    name: 'ESLint configuration',
    description: 'eslint.config.eslint.description',
    link: 'https://github.com/vuejs/eslint-plugin-vue',
    icon: '.eslintrc.json',
    files: {
      json: ['.eslintrc', '.eslintrc.json'],
      js: ['.eslintrc.js'],
      package: 'eslintConfig'
    },
    onRead: ({ data }) => ({
      prompts: [
        {
          name: 'vue/attribute-hyphenation',
          type: 'list',
          message: 'Attribute hyphenation',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'Enforce attribute naming style in template (`my-prop` or `myProp`)',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attribute-hyphenation.md',
          default: JSON.stringify('off'),
          choices: [
            {
              name: 'Off',
              value: JSON.stringify('off')
            },
            {
              name: 'Never',
              value: JSON.stringify(['error', 'never'])
            },
            {
              name: 'Always',
              value: JSON.stringify(['error', 'always'])
            }
          ],
          value: data.rules && JSON.stringify(data.rules['vue/attribute-hyphenation'])
        },
        {
          name: 'vue/html-end-tags',
          type: 'confirm',
          message: 'Template end tags style',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'End tag on Void elements, end tags and self-closing opening tags',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/html-end-tags.md',
          default: false,
          value: data.rules && data.rules['vue/html-end-tags'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        },
        {
          name: 'vue/html-indent',
          type: 'list',
          message: 'Template indentation',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'Enforce indentation in template',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/html-indent.md',
          default: JSON.stringify('off'),
          choices: [
            {
              name: 'Off',
              value: JSON.stringify('off')
            },
            {
              name: 'Tabs',
              value: JSON.stringify(['error', 'tabs'])
            },
            {
              name: '2 spaces',
              value: JSON.stringify(['error', 2])
            },
            {
              name: '4 spaces',
              value: JSON.stringify(['error', 4])
            },
            {
              name: '8 spaces',
              value: JSON.stringify(['error', 8])
            }
          ],
          value: data.rules && JSON.stringify(data.rules['vue/html-indent'])
        },
        {
          name: 'vue/html-self-closing',
          type: 'confirm',
          message: 'Template tag self-closing style',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'Self-close any component or non-Void element tags',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/html-self-closing.md',
          default: false,
          value: data.rules && data.rules['vue/html-self-closing'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        },
        {
          name: 'vue/require-default-prop',
          type: 'confirm',
          message: 'Require default in required props',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'This rule requires default value to be set for each props that are not marked as `required`',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/require-default-prop.md',
          default: false,
          value: data.rules && data.rules['vue/require-default-prop'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        },
        {
          name: 'vue/require-prop-types',
          type: 'confirm',
          message: 'Require types for props',
          group: 'eslint.config.eslint.groups.strongly-recommended',
          description: 'In committed code, prop definitions should always be as detailed as possible, specifying at least type(s)',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/require-prop-types.md',
          default: false,
          value: data.rules && data.rules['vue/require-prop-types'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        },
        {
          name: 'vue/attributes-order',
          type: 'confirm',
          message: 'Attribute order',
          group: 'eslint.config.eslint.groups.recommended',
          description: 'This rule aims to enforce ordering of component attributes (the default order is specified in the Vue style guide)',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/attributes-order.md',
          default: false,
          value: data.rules && data.rules['vue/attributes-order'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        },
        {
          name: 'vue/html-quotes',
          type: 'list',
          message: 'Attribute quote style',
          group: 'eslint.config.eslint.groups.recommended',
          description: 'Enforce style of the attribute quotes in templates',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/html-quotes.md',
          default: JSON.stringify('off'),
          choices: [
            {
              name: 'Off',
              value: JSON.stringify('off')
            },
            {
              name: 'Double quotes',
              value: JSON.stringify(['error', 'double'])
            },
            {
              name: 'Single quotes',
              value: JSON.stringify(['error', 'single'])
            }
          ],
          value: data.rules && JSON.stringify(data.rules['vue/html-quotes'])
        },
        {
          name: 'vue/order-in-components',
          type: 'confirm',
          message: 'Component options order',
          group: 'eslint.config.eslint.groups.recommended',
          description: 'This rule aims to enforce ordering of component options (the default order is specified in the Vue style guide)',
          link: 'https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/order-in-components.md',
          default: false,
          value: data.rules && data.rules['vue/order-in-components'] === 'error',
          filter: input => JSON.stringify(input ? 'error' : 'off'),
          transformer: input => input === JSON.stringify('error')
        }
      ]
    }),
    onWrite: async ({ api, prompts }) => {
      const result = {}
      for (const prompt of prompts) {
        result[`rules.${prompt.id}`] = await api.getAnswer(prompt.id, JSON.parse)
      }
      api.setData(result)
    }
  })

  api.describeConfig({
    id: 'eslintrc-config',
    name: 'ESLint extra',
    description: 'eslint.config.eslint-extra.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#configuration',
    icon: '.eslintrc.json',
    files: {
      js: ['vue.config.js']
    },
    onRead: ({ data }) => ({
      prompts: [
        {
          name: 'lintOnSave',
          type: 'confirm',
          message: 'eslint.config.eslint-extra.lintOnSave.message',
          description: 'eslint.config.eslint-extra.lintOnSave.description',
          link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#configuration',
          default: false,
          value: data.lintOnSave
        }
      ]
    }),
    onWrite: async ({ api, prompts }) => {
      const result = {}
      for (const prompt of prompts) {
        result[prompt.id] = await api.getAnswer(prompt.id)
      }
      api.setData(result)
    }
  })

  // Tasks
  api.describeTask({
    match: /vue-cli-service lint/,
    description: 'eslint.tasks.lint.description',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#injected-commands',
    prompts: [
      {
        name: 'noFix',
        type: 'confirm',
        default: false,
        description: 'eslint.tasks.lint.noFix'
      }
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.noFix) args.push('--no-fix')
    }
  })
}
