const compilerSFC = require('@vue/compiler-sfc')

module.exports = {
  parseComponent (content, options) {
    const result = compilerSFC.parse(content, options)
    const { script } = result.descriptor

    // fork-ts-checker-webpack-plugin needs to use the `start` property,
    // which doesn't present in the `@vue/compiler-sfc` parse result
    if (script) {
      script.start = script.loc.start.offset
    }

    return result
  }
}
