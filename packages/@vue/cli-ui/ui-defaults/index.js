module.exports = api => {
  require('./tasks')(api)
  require('./suggestions')(api)
}
