const deepmerge = require('deepmerge')
const defaultPreset = require('../default/jest-preset')

// If no default babel preset exists,
// we need to use a customized babel transformer to deal with es modules

module.exports = deepmerge(
  defaultPreset,
  {
    transform: {
      '^.+\\.jsx?$': require.resolve('./esmoduleTransformer')
    },
    globals: {
      'vue-jest': {
        babelConfig: {
          plugins: ['babel-plugin-transform-es2015-modules-commonjs']
        }
      }
    }
  }
)
