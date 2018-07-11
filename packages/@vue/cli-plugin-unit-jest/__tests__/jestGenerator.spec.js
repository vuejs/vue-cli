const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the babel & eslint plugin
    {
      id: 'babel',
      apply: () => {},
      options: {}
    },
    {
      id: 'eslint',
      apply: () => {},
      options: {}
    }
  ])

  expect(pkg.scripts['test:unit']).toBe('vue-cli-service test:unit')
  expect(pkg.devDependencies).toHaveProperty('@vue/test-utils')

  // should inject babel-jest
  expect(pkg.devDependencies).toHaveProperty('babel-jest')
  // babel-core 6 -> 7 shim
  expect(pkg.devDependencies).toHaveProperty('babel-core')
  // eslint
  expect(files['tests/unit/.eslintrc.js']).toMatch('jest: true')

  const spec = files['tests/unit/HelloWorld.spec.js']
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(msg)`)
})

test('without babel/eslint', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(pkg.devDependencies).not.toHaveProperty('babel-jest')
  expect(files['tests/unit/.eslintrc.js']).toBeUndefined()
})
