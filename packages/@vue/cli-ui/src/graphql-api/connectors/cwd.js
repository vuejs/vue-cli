const channels = require('../channels')

let cwd = process.cwd()

module.exports = {
  get: () => cwd,
  set: (value, context) => {
    cwd = value
    process.env.VUE_CLI_CONTEXT = value
    context.pubsub.publish(channels.CWD_CHANGED, { cwdChanged: value })
    try {
      process.chdir(value)
    } catch (err) {}
  }
}
