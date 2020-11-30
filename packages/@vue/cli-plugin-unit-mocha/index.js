module.exports = api => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'test') {
      webpackConfig.merge({
        target: 'node',
        devtool: 'inline-cheap-module-source-map'
      })

      const { semver, loadModule } = require('@vue/cli-shared-utils')
      const vue = loadModule('vue', api.service.context)
      const isVue3 = (vue && semver.major(vue.version) === 3)

      // when target === 'node', vue-loader will attempt to generate
      // SSR-optimized code. We need to turn that off here.
      webpackConfig.module
        .rule('vue')
          .use('vue-loader')
          .tap(options => {
            if (isVue3) {
              options.isServerBuild = false
            } else {
              options.optimizeSSR = false
            }

            return options
          })
    }
  })

  api.registerCommand('test:unit', {
    description: 'run unit tests with mochapack',
    usage: 'vue-cli-service test:unit [options] [...files]',
    options: {
      '--watch, -w': 'run in watch mode',
      '--grep, -g': 'only run tests matching <pattern>',
      '--slow, -s': '"slow" test threshold in milliseconds',
      '--timeout, -t': 'timeout threshold in milliseconds',
      '--bail, -b': 'bail after first test failure',
      '--require, -r': 'require the given module before running tests',
      '--include': 'include the given module into test bundle',
      '--inspect-brk': 'Enable inspector to debug the tests'
    },
    details: (
      `The above list only includes the most commonly used options.\n` +
      `For a full list of available options, see\n` +
      `https://sysgears.github.io/mochapack/docs/installation/cli-usage.html`
    )
  }, (args, rawArgv) => {
    let nodeArgs = []

    const inspectPos = rawArgv.findIndex(arg => arg.startsWith('--inspect-brk'))
    if (inspectPos !== -1) {
      nodeArgs = rawArgv.splice(inspectPos, 1)
    }
    // for @vue/babel-preset-app <= v4.0.0-rc.7
    process.env.VUE_CLI_BABEL_TARGET_NODE = true
    // start runner
    const { execa } = require('@vue/cli-shared-utils')
    const bin = require.resolve('mochapack/bin/mochapack')
    const hasInlineFilesGlob = args._ && args._.length
    const argv = [
      ...nodeArgs,
      bin,
      '--recursive',
      '--require',
      require.resolve('./setup.js'),
      '--webpack-config',
      require.resolve('@vue/cli-service/webpack.config.js'),
      ...rawArgv,
      ...(hasInlineFilesGlob ? [] : [
        api.hasPlugin('typescript')
          ? `tests/unit/**/*.spec.ts`
          : `tests/unit/**/*.spec.js`
      ])
    ]

    return new Promise((resolve, reject) => {
      const child = execa('node', argv, { stdio: 'inherit' })
      child.on('error', reject)
      child.on('exit', code => {
        if (code !== 0) {
          reject(`mochapack exited with code ${code}.`)
        } else {
          resolve()
        }
      })
    })
  })
}

module.exports.defaultModes = {
  'test:unit': 'test'
}
