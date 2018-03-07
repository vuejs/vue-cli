const babel = require('@babel/core')
const preset = require('../index')
const defaultOptions = {
  babelrc: false,
  presets: [preset]
}

test('polyfill detection', () => {
  let { code } = babel.transformSync(`
    const a = Promise.resolve()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { node: 'current' }
    }]]
  })
  expect(code).not.toMatch(`import "core-js/modules/es6.promise"`)

  ;({ code } = babel.transformSync(`
    const a = Promise.resolve()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 }
    }]]
  }))
  expect(code).toMatch(`import "core-js/modules/es6.promise"`)
})

test('object spread', () => {
  const { code } = babel.transformSync(`
    const a = { ...b }
  `.trim(), defaultOptions)
  expect(code).toMatch(`import "core-js/modules/es6.object.assign"`)
  expect(code).toMatch(`var a = Object.assign({}, b)`)
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
  expect(code).toMatch(/@babel.*runtime\/helpers\/asyncToGenerator/)
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
