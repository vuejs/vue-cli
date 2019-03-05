// add polyfill imports to the first file encountered.
module.exports = ({ types }, { entryFiles = [] }) => {
  return {
    name: 'vue-cli-inject-polyfills',
    visitor: {
      Program (path, state) {
        if (!entryFiles.includes(state.filename)) {
          return
        }

        const { polyfills } = state.opts
        const { createImport } = require('@babel/preset-env/lib/utils')
        // imports are injected in reverse order
        polyfills.slice().reverse().forEach(p => {
          createImport(path, p)
        })
      }
    }
  }
}
