module.exports = api => {
  api.extendPackage(pkg => {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies
    }

    if (!allDeps['@playwright/test']) {
      return {
        devDependencies: {
          '@playwright/test': require('../package.json').devDependencies['@playwright/test']
        }
      }
    }
  })
}
