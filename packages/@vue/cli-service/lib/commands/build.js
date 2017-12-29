const defaults = {
  mode: 'production',
  target: 'app',
  extractCSS: true,
  sourceMap: true,
  cssSourceMap: false
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build',
    options: {
      '--mode': `specify env mode (default: ${defaults.mode})`,
      '--target': `app | library | web-component (default: ${defaults.target})`,
      '--extractCSS': `extract component CSS into one file. (default: ${defaults.extractCSS})`,
      '--sourceMap': `generate source map (default: ${defaults.sourceMap})`,
      '--cssSourceMap': `generate source map for CSS (default: ${defaults.cssSourceMap})`
    }
  }, args => {
    api.setMode(args.mode || defaults.mode)
  })
}
