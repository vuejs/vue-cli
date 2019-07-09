module.exports = api => {
  api.addProjectType('vue', config => {
    // Detect Vue CLI project
    config.filterProject(({ pkg }) => ({ ...pkg.dependencies, ...pkg.devDependencies })['@vue/cli-service'])
  })
}
