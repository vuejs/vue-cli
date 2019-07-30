module.exports = (api, options = {}, rootOptions = {}) => {
  api.assertCliVersion('^4.0.0-alpha.3')
  api.assertCliServiceVersion('^4.0.0-alpha.3')

  require(`./${options.type || 'init'}`)(api, options, rootOptions)

  if (api.invoking) {
    if (api.hasPlugin('typescript')) {
      /* eslint-disable-next-line node/no-extraneous-require */
      const convertFiles = require('@vue/cli-plugin-typescript/generator/convert')
      convertFiles(api)
    }
  }
}
