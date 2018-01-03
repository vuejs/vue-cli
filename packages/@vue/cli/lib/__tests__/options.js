jest.mock('fs')

const fs = require('fs')
const {
  rcPath,
  saveOptions,
  loadSavedOptions,
  savePartialOptions
} = require('../options')

it('save options', () => {
  saveOptions({
    packageManager: 'npm',
    plugins: {},
    foo: 'bar'
  })
  const options = JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
  expect(options).toEqual({
    packageManager: 'npm',
    plugins: {}
  })
})

it('load options', () => {
  expect(loadSavedOptions()).toEqual({
    packageManager: 'npm',
    plugins: {}
  })
  fs.unlinkSync(rcPath)
  expect(loadSavedOptions()).toEqual({})
})

it('save partial options', () => {
  savePartialOptions({
    packageManager: 'yarn'
  })
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn'
  })

  savePartialOptions({
    plugins: {
      foo: { a: 1, b: 2 }
    }
  })
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      foo: { a: 1, b: 2 }
    }
  })

  savePartialOptions({
    plugins: {
      foo: { a: 2, c: 3 },
      bar: { d: 4 }
    }
  })
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      foo: { a: 2, b: 2, c: 3 },
      bar: { d: 4 }
    }
  })
})
