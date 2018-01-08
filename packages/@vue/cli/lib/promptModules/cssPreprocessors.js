module.exports = cli => {
  cli.injectFeature({
    name: 'CSS Pre-processors',
    value: 'css-preprocessor'
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
