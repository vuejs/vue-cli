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

  const config = service.resolveWebpackConfig()
  const rule = config.module.rules.find(rule => rule.test.test('foo.ts'))
  expect(rule.use[0].loader).toBe('cache-loader')
  expect(rule.use[1].loader).toBe('babel-loader')
  expect(rule.use[2].loader).toBe('cache-loader')
  expect(rule.use[3].loader).toBe('ts-loader')
})

const creatorOptions = {
  plugins: {
    '@vue/cli-plugin-typescript': {},
    '@vue/cli-plugin-babel': {}
  }
}

assertServe('ts-babel-serve', creatorOptions)
assertBuild('ts-babel-build', creatorOptions)
