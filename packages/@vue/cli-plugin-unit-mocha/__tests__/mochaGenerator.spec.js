const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha',
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

  expect(pkg.scripts['test:unit']).toBe('vue-cli-service test:unit')
  expect(pkg.devDependencies).toHaveProperty('@vue/test-utils')
  expect(files['tests/unit/.eslintrc.js']).toMatch('mocha: true')

  const spec = files['tests/unit/HelloWorld.spec.js']
  expect(spec).toMatch(`import { expect } from 'chai'`)
  expect(spec).toMatch(`expect(wrapper.text()).to.include(msg)`)
})
