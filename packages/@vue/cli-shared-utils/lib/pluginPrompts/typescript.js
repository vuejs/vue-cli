exports.classComponent = {
  name: 'classComponent',
  type: 'confirm',
  message: 'Use class-style component syntax?',
  description: 'Use the @Component decorator on classes.',
  link: 'https://vuejs.org/v2/guide/typescript.html#Class-Style-Vue-Components',
  default: true
}

exports.useTsWithBabel = {
  name: 'useTsWithBabel',
  type: 'confirm',
  message: 'Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)?',
  description: 'It will output ES2015 and delegate the rest to Babel for auto polyfill based on browser targets.'
}

exports.useTsLint = {
  name: `lint`,
  type: `confirm`,
  message: `Use TSLint?`
}

exports.convertJsToTs = {
  name: `convertJsToTs`,
  type: `confirm`,
  message: `Convert all .js files to .ts?`,
  default: true
}

exports.allowJs = {
  name: `allowJs`,
  type: `confirm`,
  message: `Allow .js files to be compiled?`,
  default: false
}
