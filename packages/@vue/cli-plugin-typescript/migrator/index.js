module.exports = api => {
  api.extendPackage(
    {
      devDependencies: {
        typescript: require('../package.json').devDependencies.typescript
      }
    },
    { warnIncompatibleVersions: false }
  )
}
