module.exports = (api, options = {}) => {
  api.assertCliVersion('^4.0.0-alpha.3')
  api.assertCliServiceVersion('^4.0.0-alpha.3')

  api.injectImports(api.entryFile, `import store from './store'`)
  api.injectRootOptions(api.entryFile, `store`)

  api.extendPackage({
    dependencies: {
      vuex: '^3.0.1'
    }
  })

  api.render('./template', {
  })

  if (api.invoking && api.hasPlugin('typescript')) {
    /* eslint-disable-next-line node/no-extraneous-require */
    const convertFiles = require('@vue/cli-plugin-typescript/generator/convert')
    convertFiles(api)
  }
}
