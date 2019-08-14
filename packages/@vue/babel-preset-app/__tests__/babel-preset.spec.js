const path = require('path')
const babel = require('@babel/core')
const preset = require('../index')
const defaultOptions = {
  babelrc: false,
  presets: [preset],
  filename: 'test-entry-file.js'
}

const getAbsolutePolyfill = mod => {
  // expected to include a `node_modules` in the import path because we use absolute path for core-js
  return new RegExp(`import "${['.*node_modules', 'core-js', 'modules', mod].join(`[\\${path.sep}]+`)}`)
}

beforeEach(() => {
  process.env.VUE_CLI_ENTRY_FILES = JSON.stringify([path.join(process.cwd(), 'test-entry-file.js')])
})

test('polyfill detection', () => {
  let { code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { node: 'current' }
    }]],
    filename: 'test-entry-file.js'
  })
  // default includes
  expect(code).not.toMatch(getAbsolutePolyfill('es.promise'))
  // usage-based detection
  expect(code).not.toMatch('import "core-js/modules/es.map"')

  ;({ code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 }
    }]],
    filename: 'test-entry-file.js'
  }))
  // default includes
  expect(code).toMatch(getAbsolutePolyfill('es.promise'))
  // promise polyfill alone doesn't work in IE, needs this as well. fix: #1642
  expect(code).toMatch(getAbsolutePolyfill('es.array.iterator'))
  // usage-based detection
  expect(code).toMatch('import "core-js/modules/es.map"')
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
    }]],
    filename: 'test-entry-file.js'
  })
  // default includes
  expect(code).not.toMatch(getAbsolutePolyfill('es.promise'))
  // usage-based detection
  expect(code).not.toMatch('import "core-js/modules/es.map"')

  ;({ code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 },
      useBuiltIns: 'entry'
    }]],
    filename: 'test-entry-file.js'
  }))
  // default includes
  expect(code).not.toMatch(getAbsolutePolyfill('es.promise'))
  // usage-based detection
  expect(code).not.toMatch('import "core-js/modules/es.map"')
  delete process.env.VUE_CLI_MODERN_BUILD
})

test('object spread', () => {
  const { code } = babel.transformSync(`
    const a = { ...b }
  `.trim(), defaultOptions)
  // expect(code).toMatch(`import _objectSpread from`)
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
  expect(code).toMatch(getAbsolutePolyfill('es.promise'))
  // should use regenerator runtime
  expect(code).toMatch(`import "regenerator-runtime/runtime"`)
  // should use required helper instead of inline
  expect(code).toMatch(/import _asyncToGenerator from ".*runtime-corejs3\/helpers\/esm\/asyncToGenerator\"/)
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

test('jsx options', () => {
  const { code } = babel.transformSync(`
    export default {
      render () {
        return <div>bar</div>
      }
    }
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      jsx: {
        injectH: false
      }
    }]]
  })
  expect(code).not.toMatch(`var h = arguments[0]`)
  expect(code).toMatch(`return h("div", ["bar"])`)
})

test('disable absoluteRuntime', () => {
  const { code } = babel.transformSync(`
    const a = [...arr]
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      absoluteRuntime: false
    }]],
    filename: 'test-entry-file.js'
  })

  expect(code).toMatch('import _toConsumableArray from "@babel/runtime-corejs3/helpers/esm/toConsumableArray"')
  expect(code).not.toMatch(getAbsolutePolyfill('es.promise'))
})
