module.exports = api => {
  // Config file
  api.describeConfig({
    id: 'eslintrc',
    name: 'ESLint configuration',
    description: 'Error checking & Code quality',
    link: 'https://eslint.org',
    icon: '.eslintrc.json',
    files: {
      json: ['.eslintrc', '.eslintrc.json'],
      js: ['.eslintrc.js'],
      package: 'eslintConfig'
    },
    onRead: ({ data }) => {
      return {
        prompts: [
          {
            name: 'rules.commaDangle',
            type: 'list',
            message: 'Trailing commas',
            description: 'Enforce or disallow trailing commas at the end of the lines',
            link: 'https://eslint.org/docs/rules/comma-dangle',
            default: JSON.stringify(['error', 'never']),
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
              },
              {
                name: 'Always on multiline',
                value: JSON.stringify(['error', 'always-multiline'])
              },
              {
                name: 'Only on multiline',
                value: JSON.stringify(['error', 'only-multiline'])
              }
            ],
            value: JSON.stringify(data.rules && data.rules['comma-dangle'])
          }
        ]
      }
    },
    onWrite: ({ api }) => {
      api.setData({
        'rules.comma-dangle': api.getAnswer('rules.commaDangle', JSON.parse)
      })
    }
  })

  // Tasks
  api.describeTask({
    match: /vue-cli-service lint/,
    description: 'Lints and fixes files',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#injected-commands',
    prompts: [
      {
        name: 'noFix',
        type: 'confirm',
        default: false,
        description: 'Do not fix errors'
      }
    ],
    onRun: ({ answers, args }) => {
      if (answers.noFix) {
        args.push('--no-fix')
      }
    }
  })
}
