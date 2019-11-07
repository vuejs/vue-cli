jest.setTimeout(30000)

const Service = require('@vue/cli-service/lib/Service')
const { assertServe, assertBuild } = require('./tsPlugin.helper')

test('using correct loader', () => {
  const service = new Service('/', {
    pkg: {},
    plugins: [
      { id: '@vue/cli-plugin-typescript', apply: require('../index') },
      { id: '@vue/cli-plugin-babel', apply: require('@vue/cli-plugin-babel') }
    ]
  })

  service.init()
  const config = service.resolveWebpackConfig()
  // eslint-disable-next-line no-shadow
  const rule = config.module.rules.find(rule => rule.test.test('foo.ts'))
  expect(rule.use[0].loader).toMatch(require.resolve('cache-loader'))
  expect(rule.use[1].loader).toMatch(require.resolve('babel-loader'))
  expect(rule.use[2].loader).toMatch(require.resolve('ts-loader'))
})

const creatorOptions = {
  plugins: {
    '@vue/cli-plugin-typescript': {},
    '@vue/cli-plugin-babel': {}
  }
}

assertServe('ts-babel-serve', creatorOptions)
assertBuild('ts-babel-build', creatorOptions)
