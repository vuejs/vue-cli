const deepmerge = require('deepmerge')
const defaultPreset = require('../jest-preset')

module.exports = deepmerge(
  defaultPreset,
  {
    moduleFileExtensions: ['ts', 'tsx'],
    transform: {
      '^.+\\.tsx?$': require.resolve('ts-jest')
    }
  }
)
