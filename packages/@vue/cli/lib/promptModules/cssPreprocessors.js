module.exports = cli => {
  cli.injectFeature({
    name: 'CSS Pre-processors',
    value: 'css-preprocessor',
    description: 'Add support for CSS pre-processors like SASS, Less or Stylus',
    link: 'https://github.com/vuejs/vue-cli/blob/dev/docs/css.md'
  })

  cli.injectPrompt({
    name: 'cssPreprocessor',
    when: answers => answers.features.includes('css-preprocessor'),
    type: 'list',
    message: 'Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default):',
    choices: [
      {
        name: 'SCSS/SASS',
        value: 'sass'
      },
      {
        name: 'LESS',
        value: 'less'
      },
      {
        name: 'Stylus',
        value: 'stylus'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.cssPreprocessor) {
      options.cssPreprocessor = answers.cssPreprocessor
    }
  })
}
