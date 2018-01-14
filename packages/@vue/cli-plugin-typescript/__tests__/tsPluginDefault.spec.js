jest.setTimeout(30000)

const { assertServe, assertBuild } = require('./tsPlugin.helper')

const options = {
  plugins: {
    '@vue/cli-plugin-typescript': {}
  }
}

assertServe('ts-default-serve', options)
assertBuild('ts-default-build', options)
