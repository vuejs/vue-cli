module.exports = api => {
  api.extendPackage({
    dependencies: {
      'register-service-worker': '^1.5.2'
    }
  })
  api.injectImports(api.entryFile, `import './registerServiceWorker'`)
  api.render('./template')

  if (api.invoking && api.hasPlugin('typescript')) {
    /* eslint-disable-next-line node/no-extraneous-require */
    const convertFiles = require('@vue/cli-plugin-typescript/generator/convert')
    convertFiles(api)
  }
}
