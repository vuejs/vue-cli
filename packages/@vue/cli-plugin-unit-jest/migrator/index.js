/** @param {import('@vue/cli/lib/MigratorAPI')} api MigratorAPI */
module.exports = (api, options, rootOptions) => {
  const isVue3 = rootOptions && rootOptions.vueVersion === '3'

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
      // Likely from @vue/cli@4
      if (isVue3) {
        newDevDeps['@vue/vue3-jest'] = '^27.0.0-alpha.3'
      } else {
        newDevDeps['@vue/vue2-jest'] = '^27.0.0-alpha.3'
      }
    }

    if (allDeps['@vue/cli-plugin-typescript'] && !allDeps['ts-jest']) {
      newDevDeps['ts-jest'] = '^27.0.4'
    }

    const toMerge = { devDependencies: newDevDeps }
    return toMerge
  })
}
