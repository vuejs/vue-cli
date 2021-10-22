/** @param {import('@vue/cli/lib/MigratorAPI')} api MigratorAPI */
module.exports = (api) => {
  api.extendPackage(pkg => {
    const newDevDeps = {
      'jest': '^27.1.0'
    }

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }

    if (!allDeps['vue-jest']) {
      // Likely a Vue 2 project, and uses the builtin preset.
      newDevDeps['@vue/vue3-jest'] = '^27.0.0-alpha.1'
    }

    if (allDeps['@vue/cli-plugin-typescript'] && !allDeps['ts-jest']) {
      newDevDeps['ts-jest'] = '^27.0.4'
    }

    const toMerge = { devDependencies: newDevDeps }
    return toMerge
  })
}
