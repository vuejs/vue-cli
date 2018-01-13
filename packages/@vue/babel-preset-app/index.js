const path = require('path')

module.exports = (context, options = {}) => {
  const presets = []
  const plugins = []

  // JSX
  if (options.jsx !== false) {
    plugins.push(
      require('@babel/plugin-syntax-jsx').default,
      require('babel-plugin-transform-vue-jsx'),
      require('babel-plugin-jsx-event-modifiers'),
      require('babel-plugin-jsx-v-model')
    )
  }

  const envOptions = {
    modules: options.modules || false,
    targets: options.targets,
    useBuiltIns: 'usage'
  }
  delete envOptions.jsx
  // target running node version (this is set by unit testing plugins)
  if (process.env.VUE_CLI_BABEL_TARGET_NODE) {
    envOptions.targets = { node: 'current' }
  }
  // cli-plugin-jest sets this to true because Jest runs without bundling
  if (process.env.VUE_CLI_BABEL_TRANSPILE_MODULES) {
    envOptions.modules = true
  }

  // pass options along to babel-preset-env
  presets.push([require('@babel/preset-env').default, envOptions])

  // stage 2. This includes some important transforms, e.g. dynamic import
  // and rest object spread.
  presets.push([require('@babel/preset-stage-2').default, {
    useBuiltIns: true
  }])

  // transform runtime, but only for helpers
  plugins.push([require('@babel/plugin-transform-runtime'), {
    polyfill: false,
    regenerator: false,
    moduleName: path.dirname(require.resolve('@babel/runtime/package.json'))
  }])

  return {
    presets,
    plugins
  }
}
