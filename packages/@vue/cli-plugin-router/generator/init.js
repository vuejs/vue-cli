module.exports = (api, options, rootOptions) => {
  api.injectImports(api.entryFile, `import router from './router'`)
  api.injectRootOptions(api.entryFile, `router`)

  api.extendPackage({
    dependencies: {
      'vue-router': '^3.0.6'
    }
  })

  api.render('./template/init', {
    bare: options.bare,
    historyMode: options.historyMode,
    doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')
  })
}
