jest.mock('fs')

const fs = require('fs')
const {
  rcPath,
  saveOptions,
  loadSavedOptions
} = require('../options')

it('load options', () => {
  expect(loadSavedOptions()).toEqual({})
  fs.writeFileSync(rcPath, JSON.stringify({
    plugins: {}
  }, null, 2))
  expect(loadSavedOptions()).toEqual({
    plugins: {}
  })
})

it('should not save unknown fields', () => {
  saveOptions({
    foo: 'bar'
  })
  expect(loadSavedOptions()).toEqual({
    plugins: {}
  })
})

it('save options (merge)', () => {
  saveOptions({
    packageManager: 'yarn'
  })
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {}
  })

  saveOptions({
    plugins: {
      foo: { a: 1 }
    }
  })
  expect(loadSavedOptions()).toEqual({
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
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      bar: { b: 2 }
    }
  })

  // deep merge
  saveOptions({
    plugins: {
      foo: { a: 2, c: 3 },
      bar: { d: 4 }
    }
  }, true)
  expect(loadSavedOptions()).toEqual({
    packageManager: 'yarn',
    plugins: {
      foo: { a: 2, c: 3 },
      bar: { b: 2, d: 4 }
    }
  })
})
