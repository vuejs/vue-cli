module.exports = (api, options) => {
  api.render(files => {
    files['README.md'] = 'hello'
  })
}
