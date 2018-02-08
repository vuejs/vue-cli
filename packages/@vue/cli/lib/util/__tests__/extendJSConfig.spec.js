const _extend = require('../extendJSConfig')

function extend (value, source) {
  return _extend(value, source).replace(/\r\n/g, '\n')
}

test(`basic`, () => {
  const value = {
    foo: true,
    css: {
      modules: true
    }
  }
  const source =
`module.exports = {
  foo: false,
  css: {
    modules: false
  }
}`
  expect(extend(value, source)).toMatch(
    `module.exports = {
  foo: true,
  css: {
    modules: true
  }
}`
  )
})

test(`adding new property`, () => {
  const value = {
    foo: true
  }
  const source =
`module.exports = {
  bar: 123
}`
  expect(extend(value, source)).toMatch(
    `module.exports = {
  bar: 123,
  foo: true
}`
  )
})

test(`non direct assignment`, () => {
  const value = {
    foo: true
  }
  const source =
`const config = {
  bar: 123
}
module.exports = config`
  expect(extend(value, source)).toMatch(
    `const config = {
  bar: 123,
  foo: true
}
module.exports = config`
  )
})
