const babel = require('@babel/core')
const preset = require('../index')
const defaultOptions = {
  babelrc: false,
  presets: [preset]
}

test('polyfill detection', () => {
  let { code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { node: 'current' }
    }]]
  })
  // default includes
  expect(code).not.toMatch(`import "core-js/modules/es6.promise"`)
  // usage-based detection
  expect(code).not.toMatch(`import "core-js/modules/es6.map"`)

  ;({ code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 }
    }]]
  }))
  // default includes
  expect(code).toMatch(`import "core-js/modules/es6.promise"`)
  // promise polyfill alone doesn't work in IE, needs this as well. fix: #1642
  expect(code).toMatch(`import "core-js/modules/es6.array.iterator"`)
  // usage-based detection
  expect(code).toMatch(`import "core-js/modules/es6.map"`)
})

test('modern mode always skips polyfills', () => {
  process.env.VUE_CLI_MODERN_BUILD = true
  let { code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 },
      useBuiltIns: 'usage'
    }]]
  })
  // default includes
  expect(code).not.toMatch(`import "core-js/modules/es6.promise"`)
  // usage-based detection
  expect(code).not.toMatch(`import "core-js/modules/es6.map"`)

  ;({ code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 },
      useBuiltIns: 'entry'
    }]]
  }))
  // default includes
  expect(code).not.toMatch(`import "core-js/modules/es6.promise"`)
  // usage-based detection
  expect(code).not.toMatch(`import "core-js/modules/es6.map"`)
  delete process.env.VUE_CLI_MODERN_BUILD
})

test('object spread', () => {
  const { code } = babel.transformSync(`
    const a = { ...b }
  `.trim(), defaultOptions)
  expect(code).toMatch(`import _objectSpread from`)
  expect(code).toMatch(`var a = _objectSpread({}, b)`)
})

test('dynamic import', () => {
  expect(() => {
    babel.transformSync(`const Foo = () => import('./Foo.vue')`, defaultOptions)
  }).not.toThrow()
})

test('async/await', () => {
  const { code } = babel.transformSync(`
    async function hello () {
      await Promise.resolve()
    }
    hello()
  `.trim(), defaultOptions)
  expect(code).toMatch(`import "core-js/modules/es6.promise"`)
  // should use regenerator runtime
  expect(code).toMatch(`import "regenerator-runtime/runtime"`)
  // should use required helper instead of inline
  expect(code).toMatch(/@babel.*runtime\/helpers\/.*asyncToGenerator/)
})

test('jsx', () => {
  const { code } = babel.transformSync(`
    export default {
      render () {
        return <div>bar</div>
      }
    }
  `.trim(), defaultOptions)
  expect(code).toMatch(`var h = arguments[0]`)
  expect(code).toMatch(`return h("div", ["bar"])`)
})
