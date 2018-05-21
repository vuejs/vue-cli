module.exports = api => {
  api.extendPackage({
    dependencies: {
      'register-service-worker': '^1.0.0'
    }
  })
  api.injectImports(`src/main.js`, `import './registerServiceWorker'`)
  api.render('./template')
}
