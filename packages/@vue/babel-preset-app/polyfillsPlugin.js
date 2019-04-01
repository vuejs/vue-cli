const { addSideEffect } = require('@babel/helper-module-imports')

// slightly modifiled from @babel/preset-env/src/utils
// use an absolute path for core-js modules, to fix conflicts of different core-js versions
function getModulePath (mod) {
  if (mod === 'regenerator-runtime') {
    return require.resolve('regenerator-runtime/runtime')
  }

  return require.resolve(`core-js/modules/${mod}`)
}

function createImport (path, mod) {
  return addSideEffect(path, getModulePath(mod))
}

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
        // imports are injected in reverse order
        polyfills
          .slice()
          .reverse()
          .forEach(p => {
            createImport(path, p)
          })
      }
    }
  }
}
