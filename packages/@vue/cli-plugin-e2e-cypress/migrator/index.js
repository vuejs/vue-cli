module.exports = api => {
  api.extendPackage(pkg => {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }

    if (!allDeps.cypress) {
      return {
        devDependencies: {
          cypress: require('../package.json').devDependencies.cypress
        }
      }
    }
  })
}
