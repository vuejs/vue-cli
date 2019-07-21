module.exports = globalApi => {
  require('./project-type')(globalApi)

  globalApi.inProject(api => {
    if (api.getProject().type === 'vue') {
      require('./config')(api)
      require('./task')(api)
      require('./suggestion')(api)
    }
  })
}
