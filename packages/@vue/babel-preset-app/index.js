const path = require('path')

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE,
  // needs this as well. see: #1642
  'es6.array.iterator',
  // this is required for webpack code splitting, vuex etc.
  'es6.promise',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es7.promise.finally'
]

function getPolyfills (targets, includes, { ignoreBrowserslistConfig, configPath }) {
  const { isPluginRequired } = require('@babel/preset-env')
  const builtInsList = require('@babel/preset-env/data/built-ins.json')
  const getTargets = require('@babel/preset-env/lib/targets-parser').default
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath
  })

  return includes.filter(item => {
    return isPluginRequired(builtInTargets, builtInsList[item])
  })
}

module.exports = (context, options = {}) => {
  const presets = []
  const plugins = []

  // JSX
  if (options.jsx !== false) {
    presets.push([require('@vue/babel-preset-jsx'), typeof options.jsx === 'object' ? options.jsx : {}])
  }

  const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    targets: rawTargets,
    spec,
    ignoreBrowserslistConfig = !!process.env.VUE_CLI_MODERN_BUILD,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy
  } = options

  // resolve targets
  let targets
  if (process.env.VUE_CLI_BABEL_TARGET_NODE) {
    // running tests in Node.js
    targets = { node: 'current' }
  } else if (process.env.VUE_CLI_BUILD_TARGET === 'wc' || process.env.VUE_CLI_BUILD_TARGET === 'wc-async') {
    // targeting browsers that at least support ES2015 classes
    // https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugins.json#L52-L61
    targets = {
      browsers: [
        'Chrome >= 49',
        'Firefox >= 45',
        'Safari >= 10',
        'Edge >= 13',
        'iOS >= 10',
        'Electron >= 0.36'
      ]
    }
  } else if (process.env.VUE_CLI_MODERN_BUILD) {
    // targeting browsers that support <script type="module">
    targets = { esmodules: true }
  } else {
    targets = rawTargets
  }

  // included-by-default polyfills. These are common polyfills that 3rd party
  // dependencies may rely on (e.g. Vuex relies on Promise), but since with
  // useBuiltIns: 'usage' we won't be running Babel on these deps, they need to
  // be force-included.
  let polyfills
  const buildTarget = process.env.VUE_CLI_BUILD_TARGET || 'app'
  if (
    buildTarget === 'app' &&
    useBuiltIns === 'usage' &&
    !process.env.VUE_CLI_BABEL_TARGET_NODE &&
    !process.env.VUE_CLI_MODERN_BUILD
  ) {
    polyfills = getPolyfills(targets, userPolyfills || defaultPolyfills, {
      ignoreBrowserslistConfig,
      configPath
    })
    plugins.push([require('./polyfillsPlugin'), { polyfills }])
  } else {
    polyfills = []
  }

  const envOptions = {
    spec,
    loose,
    debug,
    modules,
    targets,
    useBuiltIns,
    ignoreBrowserslistConfig,
    configPath,
    include,
    exclude: polyfills.concat(exclude || []),
    shippedProposals,
    forceAllTransforms
  }

  // cli-plugin-jest sets this to true because Jest runs without bundling
  if (process.env.VUE_CLI_BABEL_TRANSPILE_MODULES) {
    envOptions.modules = 'commonjs'
    // necessary for dynamic import to work in tests
    plugins.push(require('babel-plugin-dynamic-import-node'))
  }

  // pass options along to babel-preset-env
  presets.unshift([require('@babel/preset-env'), envOptions])

  // additional <= stage-3 plugins
  // Babel 7 is removing stage presets altogether because people are using
  // too many unstable proposals. Let's be conservative in the defaults here.
  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    }],
    [require('@babel/plugin-proposal-class-properties'), { loose }],
  )

  // transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',
    // use @babel/runtime-corejs2 so that helpers that need polyfillable APIs will reference core-js instead.
    // if useBuiltIns is not set to 'usage', then it means users would take care of the polyfills on their own,
    // i.e., core-js 2 is no longer needed.
    corejs: (useBuiltIns === 'usage' && !process.env.VUE_CLI_MODERN_BUILD) ? 2 : false,
    helpers: useBuiltIns === 'usage',
    useESModules: !process.env.VUE_CLI_BABEL_TRANSPILE_MODULES,
    absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
  }])

  return {
    presets,
    plugins
  }
}
