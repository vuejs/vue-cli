const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { files, pkg } = await generateWithPlugin({
    id: 'vuex',
    apply: require('../generator'),
    options: {}
  })

  expect(files['src/store/index.js']).toBeTruthy()
  expect(files['src/store/index.js']).toMatch('import Vuex')

  expect(pkg.dependencies).toHaveProperty('vuex')
})

test('use with Vue 3', async () => {
  const { files, pkg } = await generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('@vue/cli-service/generator'),
      options: {
        vueVersion: '3'
      }
    },
    {
      id: 'vuex',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/store/index.js']).toBeTruthy()
  expect(files['src/store/index.js']).toMatch('import { createStore }')
  expect(files['src/main.js']).toMatch('.use(store)')

  expect(pkg.dependencies).toHaveProperty('vuex')
  expect(pkg.dependencies.vuex).toMatch('^4')
})
