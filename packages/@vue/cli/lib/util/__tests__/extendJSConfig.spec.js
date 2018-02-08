const extend = require('../extendJSConfig')

function assertMatch (source, expected) {
  source = source.split(/\n\r?/g)
  expected = expected.split(/\n\r?/g)
  expect(source).toEqual(expected)
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
  assertMatch(extend(value, source),
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
  assertMatch(extend(value, source),
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
  assertMatch(extend(value, source),
    `const config = {
  bar: 123,
  foo: true
}
module.exports = config`
  )
})
