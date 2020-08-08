jest.setTimeout(300000)

const { assertServe, assertBuild } = require('./tsPlugin.helper')

const options = {
  vueVersion: '3',
  plugins: {
    '@vue/cli-plugin-typescript': {}
  }
}

assertServe('ts-vue-3-serve', options, true)
assertBuild('ts-vue-3-build', options, undefined, true)
