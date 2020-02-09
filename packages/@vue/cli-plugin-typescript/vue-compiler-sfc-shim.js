const compilerSFC = require('@vue/compiler-sfc')

module.exports = {
  parseComponent (content, options) {
    return compilerSFC.parse(content, options)
  }
}
