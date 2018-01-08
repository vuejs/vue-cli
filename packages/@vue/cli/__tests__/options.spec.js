jest.mock('fs')

const fs = require('fs')
const {
  rcPath,
  loadOptions,
  saveOptions
} = require('../lib/options')

test('load options', () => {
  expect(loadOptions()).toEqual({})
  fs.writeFileSync(rcPath, JSON.stringify({
    plugins: {}
  }, null, 2))
  expect(loadOptions()).toEqual({
    plugins: {}
  })
})

test('should not save unknown fields', () => {
  saveOptions({
    foo: 'bar'
  })
  expect(loadOptions()).toEqual({
    plugins: {}
  })
})

test('save options (merge)', () => {
  saveOptions({
    packageManager: 'yarn'
  })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {}
  })

  saveOptions({
    plugins: {
      foo: { a: 1 }
    }
  })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      foo: { a: 1 }
    }
  })

  // shallow save should replace fields
  saveOptions({
    plugins: {
      bar: { b: 2 }
    }
  })
  expect(loadOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      bar: { b: 2 }
    }
  })
})

test('save options (replace)', () => {
  const toSave = {
    foo: 'bar'
  }
  saveOptions(toSave, true)
  expect(loadOptions()).toEqual(toSave)
})
