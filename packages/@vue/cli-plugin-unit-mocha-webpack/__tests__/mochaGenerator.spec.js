const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha-webpack',
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
  expect(pkg.devDependencies).toHaveProperty('vue-test-utils')
  expect(files['test/unit/.eslintrc']).toMatch('"mocha": true')
  expect(files['test/unit/HelloWorld.spec.js']).toMatch('// assert wrapper.text() equals msg')
})

test('chai', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha-webpack-chai',
      apply: require('../generator'),
      options: {
        assertionLibrary: 'chai'
      }
    }
  ])

  expect(pkg.scripts.test).toBeTruthy()
  expect(pkg.devDependencies).toHaveProperty('vue-test-utils')

  const spec = files['test/unit/HelloWorld.spec.js']
  expect(spec).toMatch(`import { expect } from 'chai'`)
  expect(spec).toMatch(`expect(wrapper.text()).to.include(msg)`)
})

test('expect', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha-webpack-expect',
      apply: require('../generator'),
      options: {
        assertionLibrary: 'expect'
      }
    }
  ])

  expect(pkg.scripts.test).toBeTruthy()
  expect(pkg.devDependencies).toHaveProperty('vue-test-utils')

  const spec = files['test/unit/HelloWorld.spec.js']
  expect(spec).toMatch(`import expect from 'expect'`)
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(msg)`)
})
