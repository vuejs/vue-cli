const path = require('path')

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE,
  // needs this as well. see: #1642
  'es.array.iterator',
  // this is required for webpack code splitting, vuex etc.
  'es.promise',
  // this is needed for object rest spread support in templates
  // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
  'es.object.assign',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es.promise.finally'
]

function getPolyfills (targets, includes, { ignoreBrowserslistConfig, configPath }) {
  const getTargets = require('@babel/helper-compilation-targets').default
  const builtInTargets = getTargets(targets, { ignoreBrowserslistConfig, configPath })

  // if no targets specified, include all default polyfills
  if (!targets && !Object.keys(builtInTargets).length) {
    return includes
  }

  const { list } = require('core-js-compat')({ targets: builtInTargets })
  return includes.filter(item => list.includes(item))
}

module.exports = (context, options = {}) => {
  const presets = []
  const plugins = []
  const defaultEntryFiles = JSON.parse(process.env.VUE_CLI_ENTRY_FILES || '[]')

  // Though in the vue-cli repo, we only use the two envrionment variables
  // for tests, users may have relied on them for some features,
  // dropping them may break some projects.
  // So in the following blocks we don't directly test the `NODE_ENV`.
  // Rather, we turn it into the two commonly used feature flags.
  if (process.env.NODE_ENV === 'test') {
    // Both Jest & Mocha set NODE_ENV to 'test'.
    // And both requires the `node` target.
    process.env.VUE_CLI_BABEL_TARGET_NODE = 'true'
    // Jest runs without bundling so it needs this.
    // With the node target, tree shaking is not a necessity,
    // so we set it for maximum compatibility.
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = 'true'
  }

  // JSX
  if (options.jsx !== false) {
    presets.push([require('@vue/babel-preset-jsx'), typeof options.jsx === 'object' ? options.jsx : {}])
  }

  const runtimePath = path.dirname(require.resolve('@babel/runtime/package.json'))
  const runtimeVersion = require('@babel/runtime/package.json').version
  const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    bugfixes = true,
    targets: rawTargets,
    spec,
    ignoreBrowserslistConfig = !!process.env.VUE_CLI_MODERN_BUILD,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy,
    // entry file list
    entryFiles = defaultEntryFiles,

    // Undocumented option of @babel/plugin-transform-runtime.
    // When enabled, an absolute path is used when importing a runtime helper after transforming.
    // This ensures the transpiled file always use the runtime version required in this package.
    // However, this may cause hash inconsistency if the project is moved to another directory.
    // So here we allow user to explicit disable this option if hash consistency is a requirement
    // and the runtime version is sure to be correct.
    absoluteRuntime = runtimePath,

    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#version
    // By default transform-runtime assumes that @babel/runtime@7.0.0-beta.0 is installed, which means helpers introduced later than 7.0.0-beta.0 will be inlined instead of imported.
    // See https://github.com/babel/babel/issues/10261
    // And https://github.com/facebook/docusaurus/pull/2111
    version = runtimeVersion
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
    plugins.push([
      require('./polyfillsPlugin'),
      { polyfills, entryFiles, useAbsolutePath: !!absoluteRuntime }
    ])
  } else {
    polyfills = []
  }

  const envOptions = {
    bugfixes,
    corejs: useBuiltIns ? 3 : false,
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
    if (process.env.VUE_CLI_BABEL_TARGET_NODE) {
      // necessary for dynamic import to work in tests
      plugins.push(require('babel-plugin-dynamic-import-node'))
    }
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
    [require('@babel/plugin-proposal-class-properties'), { loose }]
  )

  // transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',

    // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
    corejs: false,

    helpers: useBuiltIns === 'usage',
    useESModules: !process.env.VUE_CLI_BABEL_TRANSPILE_MODULES,

    absoluteRuntime,

    version
  }])

  return {
    sourceType: 'unambiguous',
    overrides: [{
      exclude: [/@babel[\/|\\\\]runtime/, /core-js/],
      presets,
      plugins
    }, {
      // there are some untranspiled code in @babel/runtime
      // https://github.com/babel/babel/issues/9903
      include: [/@babel[\/|\\\\]runtime/],
      presets: [
        [require('@babel/preset-env'), {
          useBuiltIns,
          corejs: useBuiltIns ? 3 : false
        }]
      ]
    }]
  }
}

// a special flag to tell @vue/cli-plugin-babel to include @babel/runtime for transpilation
// otherwise the above `include` option won't take effect
process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME = true
