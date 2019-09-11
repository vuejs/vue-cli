module.exports = api => {
  api.extendPackage({
    dependencies: {
      'register-service-worker': '^1.6.2'
    },
    devDependencies: {
      'workbox-webpack-plugin': '^4.3.1'
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
