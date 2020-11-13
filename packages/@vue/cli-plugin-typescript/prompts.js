// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

module.exports = [
  {
    name: `classComponent`,
    type: `confirm`,
    message: `Use class-style component syntax?`,
    default: true
  },
  {
    name: `useTsWithBabel`,
    type: `confirm`,
    message: 'Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)?'
  },
  {
    name: `convertJsToTs`,
    type: `confirm`,
    message: `Convert all .js files to .ts?`,
    default: true
  },
  {
    name: `allowJs`,
    type: `confirm`,
    message: `Allow .js files to be compiled?`,
    default: false
  },
  {
    name: 'skipLibCheck',
    type: `confirm`,
    message: `Skip type checking of all declaration files (recommended for apps)?`,
    default: true
  }
]
