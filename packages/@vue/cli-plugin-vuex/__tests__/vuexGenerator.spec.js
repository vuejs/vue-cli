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
