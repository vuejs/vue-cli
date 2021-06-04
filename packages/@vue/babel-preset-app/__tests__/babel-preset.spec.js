const path = require('path')
const babel = require('@babel/core')
const preset = require('../index')
const defaultOptions = {
  babelrc: false,
  presets: [[preset, { targets: { ie: 9 } }]],
  filename: 'test-entry-file.js'
}

const getAbsolutePolyfill = mod => {
  // expected to include a `node_modules` in the import path because we use absolute path for core-js
  return new RegExp(`"${['.*node_modules', 'core-js', 'modules', mod].join(`[\\${path.sep}]+`)}`)
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
  expect(code).not.toMatch('core-js/modules/es.map')

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
  expect(code).toMatch('core-js/modules/es.map')
})

test('modern mode always skips unnecessary polyfills', () => {
  process.env.VUE_CLI_MODERN_BUILD = true
  let { code } = babel.transformSync(`
    const a = new Map()
    console.log(globalThis)
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9, safari: '12' },
      useBuiltIns: 'usage'
    }]],
    filename: 'test-entry-file.js'
  })
  // default includes that are supported in all modern browsers should be skipped
  expect(code).not.toMatch('es.assign')
  // though es.promise is not supported in all modern browsers
  // (modern: safari >= 10.1, es.promise: safrai >= 11)
  // the custom configuration only expects to support safari >= 12
  // so it can be skipped
  expect(code).not.toMatch('es.promise[^.]')
  // es.promise.finally is supported in safari >= 13.0.3
  // so still needs to be included
  expect(code).toMatch('es.promise.finally')

  // usage-based detection
  // Map is supported in all modern browsers
  expect(code).not.toMatch('es.map')
  // globalThis is not supported until safari 12.1
  expect(code).toMatch('es.global-this')

  ;({ code } = babel.transformSync(`
    const a = new Map()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9, safari: '12' },
      useBuiltIns: 'entry'
    }]],
    filename: 'test-entry-file.js'
  }))
  // default includes
  expect(code).not.toMatch('es.promise[^.]')
  expect(code).not.toMatch('es.promise.finally')
  // usage-based detection
  expect(code).not.toMatch('core-js/modules/es.map')
  expect(code).not.toMatch('es.global-this')
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
  expect(code).toMatch(`regenerator-runtime/runtime`)
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
    }]],
    filename: 'test-entry-file.js'
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
      targets: { ie: 9 },
      absoluteRuntime: false
    }]],
    filename: 'test-entry-file.js'
  })

  expect(code).toMatch('@babel/runtime/helpers/toConsumableArray')
  expect(code).not.toMatch(getAbsolutePolyfill('es.promise'))
})

test('should inject polyfills / helpers using "require" statements for a umd module', () => {
  const { code } = babel.transformSync(`
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Vue = factory());
  }(this, function () {
    const a = [...arr]
    new Promise()
  }))
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 },
      absoluteRuntime: false
    }]],
    filename: 'test-entry-file.js'
  })
  expect(code).toMatch('require("@babel/runtime/helpers/toConsumableArray')
  expect(code).toMatch('require("core-js/modules/es.promise')
  expect(code).not.toMatch('import ')
})

test('should inject polyfills / helpers using "import" statements for an es module', () => {
  const { code } = babel.transformSync(`
    import Vue from 'vue'
    const a = [...arr]
    new Promise()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      targets: { ie: 9 },
      absoluteRuntime: false
    }]],
    filename: 'test-entry-file.js'
  })

  expect(code).toMatch('import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray')
  expect(code).toMatch('import "core-js/modules/es.promise')
  expect(code).not.toMatch('require(')
})

test('should not inject excluded polyfills', () => {
  const { code } = babel.transformSync(`
    new Promise()
  `.trim(), {
    babelrc: false,
    presets: [[preset, {
      exclude: ['es.promise'],
      polyfills: ['es.array.iterator', 'es.object.assign']
    }]],
    filename: 'test-entry-file.js'
  })

  expect(code).not.toMatch('es.promise')
})
