module.exports = api => {
  require('./tasks')(api)
  require('./suggestions')(api)
  require('./config')(api)
  require('./widgets')(api)
}
