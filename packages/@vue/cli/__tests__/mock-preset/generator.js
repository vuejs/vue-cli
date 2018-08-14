module.exports = (api, options) => {
  api.render(files => {
    files['test.js'] = options.ok ? 'true' : 'false'
  })
}
