module.exports = (api, options) => {
  api.injectImports(api.entryFile, `import store from './store'`)
  api.injectRootOptions(api.entryFile, `store`)
  api.extendPackage({
    dependencies: {
      vuex: '^3.0.1'
    }
  })
  api.render('./template')
}
