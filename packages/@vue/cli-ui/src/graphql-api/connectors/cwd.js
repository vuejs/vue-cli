const channels = require('../channels')

let cwd = process.cwd()

module.exports = {
  get: () => cwd,
  set: (value, context) => {
    cwd = value
    context.pubsub.publish(channels.CWD_CHANGED, { cwdChanged: value })
    try {
      process.chdir(value)
    } catch (err) {}
  }
}
