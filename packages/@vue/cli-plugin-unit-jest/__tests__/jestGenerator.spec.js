const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the eslint plugin
    {
      id: 'eslint',
      apply: () => {},
      options: {}
    }
  ])

  expect(pkg.scripts.test).toBeTruthy()
  expect(pkg.devDependencies).toHaveProperty('@vue/test-utils')
  expect(pkg.devDependencies).toHaveProperty('babel-jest')
  expect(files['tests/unit/.eslintrc']).toMatch('"jest": true')

  const spec = files['tests/unit/HelloWorld.spec.js']
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(msg)`)
})
