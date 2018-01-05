module.exports = api => {
  api.registerCommand('test', {
    description: 'run unit tests with jest'
  }, args => {
    api.setMode('test')
    // for @vue/babel-preset-app
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
    process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true

    // TODO execa jest w/ --config jest.config.js
  })
}
