const deepmerge = require('deepmerge')
const defaultTsPreset = require('../typescript/jest-preset')

module.exports = deepmerge(
  defaultTsPreset,
  {
    globals: {
      'ts-jest': {
        babelConfig: true
      }
    }
  }
)
