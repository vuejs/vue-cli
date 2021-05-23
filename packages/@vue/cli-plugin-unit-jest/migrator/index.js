/** @param {import('@vue/cli/lib/MigratorAPI')} api MigratorAPI */
module.exports = (api) => {
  api.extendPackage(pkg => {
    const newDevDeps = {}

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }

    if (!allDeps['vue-jest']) {
      // Likely a Vue 2 project, and uses the builtin preset.
      // Because we used to add `vue-jest` v5 to dev deps for Vue 3 projects.
      newDevDeps['vue-jest'] = '^4.0.1'
    }

    if (allDeps['@vue/cli-plugin-typescript'] && !allDeps['ts-jest']) {
      newDevDeps['ts-jest'] = '^26.5.3'
    }

    const toMerge = { devDependencies: newDevDeps }
    return toMerge
  })
}
