const envOpts = {}

if (process.env.BABEL_ENV === 'node') {
  envOpts.targets = { node: 9 }
  envOpts.modules = 'commonjs'
}

if (process.env.BABEL_ENV === 'browser') {
  envOpts.targets = { browsers: ['>0.5%'] }
  envOpts.modules = false
  envOpts.useBuiltIns = 'entry'
}

const config = {
  comments: false,
  presets: [['@babel/env', envOpts]],
  plugins: [
    ['babel-plugin-inline-import', { extensions: ['.glsl'] }],
    'lodash',
    '@babel/proposal-class-properties',
    ['@babel/proposal-object-rest-spread', { useBuiltIns: true }]
  ]
}

module.exports = config
