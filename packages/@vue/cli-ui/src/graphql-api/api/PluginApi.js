class PluginApi {
  constructor () {
    this.configurations = []
    this.tasks = []
  }

  describeConfig (options) {
    this.configurations.push(options)
  }

  describeTask (options) {
    this.tasks.push(options)
  }

  getTask (command) {
    return this.tasks.find(
      options => options.match.test(command)
    )
  }
}

module.exports = PluginApi
