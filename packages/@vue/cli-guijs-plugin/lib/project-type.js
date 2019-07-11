module.exports = api => {
  api.addProjectType('vue', config => {
    config.logo = '/_plugin/@vue%2Fcli-guijs-plugin/vue-project.png'

    // Detect Vue CLI project
    config.filterProject(({ pkg }) => ({ ...pkg.dependencies, ...pkg.devDependencies })['@vue/cli-service'])
  })
}
