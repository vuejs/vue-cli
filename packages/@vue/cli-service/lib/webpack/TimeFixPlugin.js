module.exports = class TimeFixPlugin {
  constructor (timefix = 11000) {
    this.timefix = timefix
  }

  apply (compiler) {
    compiler.plugin('watch-run', (watching, callback) => {
      watching.startTime += this.timefix
      callback()
    })

    compiler.plugin('done', stats => {
      stats.startTime -= this.timefix
    })
  }
}
