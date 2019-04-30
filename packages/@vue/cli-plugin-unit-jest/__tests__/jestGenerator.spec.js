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

  const spec = files['tests/unit/example.spec.js']
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

test('with TS', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    // mock presence of the ts plugin
    {
      id: 'typescript',
      apply: () => {},
      options: {}
    }
  ])

  const spec = files['tests/unit/example.spec.ts']
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(msg)`)
})

test('bare', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    {
      id: '@vue/cli-service',
      apply: () => {},
      options: { bare: true }
    }
  ])

  const spec = files['tests/unit/example.spec.js']
  expect(spec).toMatch(`const wrapper = shallowMount(App)`)
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(\`Welcome to Your Vue.js App\`)`)
})

test('TS + bare', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'unit-jest',
      apply: require('../generator'),
      options: {}
    },
    {
      id: 'typescript',
      apply: () => {},
      options: {}
    },
    {
      id: '@vue/cli-service',
      apply: () => {},
      options: { bare: true }
    }
  ])

  const spec = files['tests/unit/example.spec.ts']
  expect(spec).toMatch(`const wrapper = shallowMount(App)`)
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(\`Welcome to Your Vue.js + TypeScript App\`)`)
})
