// these prompts are used if the plugin is late-installed into an existing
// project and invoked by `vue invoke`.

const {
  lintOn
} = require('@vue/cli-shared-utils/lib/pluginPrompts/eslint')
const {
  classComponent,
  useTsWithBabel,
  useTsLint,
  convertJsToTs,
  allowJs
} = require('@vue/cli-shared-utils/lib/pluginPrompts/typescript')

const prompts = module.exports = [
  classComponent,
  useTsWithBabel,
  useTsLint,
  {
    ...lintOn,
    when: answers => answers.lint
  },
  convertJsToTs,
  allowJs
]

// in RC6+ the export can be function, but that would break invoke for RC5 and
// below, so this is a temporary compatibility hack until we release stable.
// TODO just export the function in 3.0.0
module.exports.getPrompts = pkg => {
  prompts[2].when = () => !('@vue/cli-plugin-eslint' in (pkg.devDependencies || {}))
  return prompts
}
