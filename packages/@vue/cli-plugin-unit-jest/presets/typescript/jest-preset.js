const deepmerge = require('deepmerge')
const defaultPreset = require('../default/jest-preset')

let tsJest = null
try {
  tsJest = require.resolve('ts-jest')
} catch (e) {
  throw new Error('Cannot resolve "ts-jest" module. Typescript preset requires "ts-jest" to be installed.')
}

module.exports = deepmerge(
  defaultPreset,
  {
    moduleFileExtensions: ['ts', 'tsx'],
    transform: {
      '^.+\\.tsx?$': tsJest
    }
  }
)
