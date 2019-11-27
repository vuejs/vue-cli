jest.setTimeout(30000)

const Service = require('@vue/cli-service/lib/Service')
const create = require('@vue/cli-test-utils/createTestProject')
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

test('tsx-build', async () => {
  const project = await create('tsx', creatorOptions)
  await project.write('src/components/HelloWorld.vue', `
  <script lang="tsx">
  import Vue, { CreateElement } from 'vue'
  import Component from 'vue-class-component'

  @Component
  export default class World extends Vue {
    render (h: CreateElement) {
      return (
        <p>This is rendered via TSX</p>
      )
    }
  }
  </script>
  `)

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')
})
