module.exports = api => {
  api.extendPackage({
    dependencies: {
      'register-service-worker': '^1.0.0'
    }
  })
  api.injectImports(api.entryFile, `import './registerServiceWorker'`)
  api.render('./template')
}
