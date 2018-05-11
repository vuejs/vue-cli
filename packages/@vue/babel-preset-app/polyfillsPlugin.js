// add polyfill imports to the first file encountered.
module.exports = ({ types }) => {
  let entryFile
  return {
    name: 'vue-cli-inject-polyfills',
    visitor: {
      Program (path, state) {
        if (!entryFile) {
          entryFile = state.filename
        } else if (state.filename !== entryFile) {
          return
        }

        const { polyfills } = state.opts
        const { createImport } = require('@babel/preset-env/lib/utils')
        polyfills.forEach(p => {
          createImport(path, p)
        })
      }
    }
  }
}
