module.exports = (api, options, rootOptions) => {
  api.extendPackage(
    {
      devDependencies: {
        typescript: require('../package.json').devDependencies.typescript
      }
    },
    { warnIncompatibleVersions: false }
  )

  // update vue 3 typescript shim
  if (rootOptions.vueVersion === 3) {
    api.transformScript('src/shims-vue.d.ts', require('../codemods/migrateComponentType'))
  }
}
