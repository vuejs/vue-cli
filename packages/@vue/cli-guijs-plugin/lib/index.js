module.exports = api => {
  require('./project-type')(api)

  if (api.getProject().type === 'vue') {
    require('./config')(api)
    require('./task')(api)
    require('./suggestion')(api)
  }
}
