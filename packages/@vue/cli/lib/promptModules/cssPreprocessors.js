module.exports = cli => {
  cli.injectFeature({
    name: 'CSS Pre-processors',
    value: 'css-preprocessor',
    description: 'Add support for CSS pre-processors like Sass, Less or Stylus',
    link: 'https://cli.vuejs.org/guide/css.html'
  })

  const notice = 'PostCSS, Autoprefixer and CSS Modules are supported by default'

  cli.injectPrompt({
    name: 'cssPreprocessor',
    when: answers => answers.features.includes('css-preprocessor'),
    type: 'list',
    message: `Pick a CSS pre-processor${process.env.VUE_CLI_API_MODE ? '' : ` (${notice})`}:`,
    description: `${notice}.`,
    choices: [
      // In Vue CLI <= 3.3, the value of Sass option in 'sass' an means 'node-sass'.
      // Considering the 'sass' package on NPM is actually for Dart Sass, we renamed it to 'node-sass'.
      // In @vue/cli-service there're still codes that accepts 'sass' as an option value, for compatibility reasons,
      // and they're meant to be removed in v4.
      {
        name: 'Sass/SCSS (with dart-sass)',
        value: 'dart-sass'
      },
      {
        name: 'Sass/SCSS (with node-sass)',
        value: 'node-sass'
      },
      {
        name: 'Less',
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
