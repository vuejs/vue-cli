const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

it('base', async () => {
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
  expect(files['test/unit/.eslintrc']).toContain('"mocha": true')
  expect(files['test/unit/HelloWorld.spec.js']).toContain('// assert wrapper.text() equals msg')
})

it('chai', async () => {
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
  expect(spec).toContain(`import { expect } from 'chai'`)
  expect(spec).toContain(`expect(wrapper.text()).to.include(msg)`)
})

it('chai', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'unit-mocha-webpack-chai',
      apply: require('../generator'),
      options: {
        assertionLibrary: 'expect'
      }
    }
  ])

  expect(pkg.scripts.test).toBeTruthy()
  expect(pkg.devDependencies).toHaveProperty('vue-test-utils')

  const spec = files['test/unit/HelloWorld.spec.js']
  expect(spec).toContain(`import expect from 'expect'`)
  expect(spec).toContain(`expect(wrapper.text()).toContain(msg)`)
})
