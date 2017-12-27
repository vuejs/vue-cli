module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build',
    options: {
      '--extractCSS': 'extract component CSS into one file.'
    }
  }, args => {
    // TODO
  })
}
