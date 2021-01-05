const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')
const create = require('@vue/cli-test-utils/createTestProject')

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

  const spec = files['tests/unit/example.spec.js']
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(msg)`)
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

test('bare + router', async () => {
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
    },
    {
      id: 'router',
      apply: () => {},
      options: {}
    }
  ])

  const spec = files['tests/unit/example.spec.js']
  expect(spec).toMatch(`const wrapper = mount(App,`)
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(\`Welcome to Your Vue.js App\`)`)
})

test('TS + bare + router', async () => {
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
    },
    {
      id: 'router',
      apply: () => {},
      options: {}
    }
  ])

  const spec = files['tests/unit/example.spec.ts']
  expect(spec).toMatch(`const wrapper = mount(App,`)
  expect(spec).toMatch(`expect(wrapper.text()).toMatch(\`Welcome to Your Vue.js App\`)`)
})

test('add types to existing tsconfig.json', async () => {
  const { dir, read, write } = await create('unit-jest-tsconfig', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await write('tsconfig.json', JSON.stringify({ compilerOptions: { types: ['some-type'] } }))

  const invoke = require('@vue/cli/lib/invoke')
  await invoke('unit-jest', {}, dir)

  const tsconfig = await read('tsconfig.json')
  expect(tsconfig).toMatch(/\r?\n$/)
  expect(JSON.parse(tsconfig).compilerOptions.types).toEqual(['some-type', 'jest'])
}, 30000)
