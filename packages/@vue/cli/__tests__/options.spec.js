jest.mock('fs')

const fs = require('fs')
const {
  rcPath,
  loadOptions,
  saveOptions,
  savePreset
} = require('../lib/options')

test('load options', () => {
  expect(loadOptions()).toEqual({})
  fs.writeFileSync(rcPath, JSON.stringify({
    presets: {}
  }, null, 2))
  expect(loadOptions()).toEqual({
    presets: {}
  })
})

test('should not save unknown fields', () => {
  saveOptions({
    foo: 'bar'
  })
  expect(loadOptions()).toEqual({
    presets: {}
  })
})

test('save options', () => {
  // partial
  saveOptions({
    packageManager: 'yarn'
  })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    presets: {}
  })

  // replace
  saveOptions({
    presets: {
      foo: { a: 1 }
    }
  })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    presets: {
      foo: { a: 1 }
    }
  })
})

test('save preset', () => {
  savePreset('bar', { a: 2 })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    presets: {
      foo: { a: 1 },
      bar: { a: 2 }
    }
  })

  // should entirely replace presets
  savePreset('foo', { c: 3 })
  savePreset('bar', { d: 4 })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    presets: {
      foo: { c: 3 },
      bar: { d: 4 }
    }
  })
})
