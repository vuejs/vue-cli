module.exports = class TimeFixPlugin {
  constructor (timefix = 11000) {
    this.timefix = timefix
  }

  apply (compiler) {
    compiler.hooks.watchRun.tap('TimeFixPlugin', watching => {
      watching.startTime += this.timefix
    })

    compiler.hooks.done.tap('TimeFixPlugin', stats => {
      stats.startTime -= this.timefix
    })
  }
}
