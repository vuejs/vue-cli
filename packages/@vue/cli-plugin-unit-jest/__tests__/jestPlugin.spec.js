jest.setTimeout(300000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-jest', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('should respect jest testMatch config', async () => {
  const project = await create('unit-jest-package.json', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  const config = JSON.parse(await project.read('package.json'))
  config.jest.testMatch = ['custom-test-directory/my.spec.js']

  await project.write('package.json', JSON.stringify(config))

  let result
  try {
    await project.run(`vue-cli-service test:unit`)
  } catch (e) {
    result = e
  }
  expect(result.stdout).toMatch('testMatch: custom-test-directory/my.spec.js')
  expect(result.stdout).toMatch('No tests found')
})

test('should respect jest.config.js testMatch config', async () => {
  const project = await create('unit-jest-jest.config.js', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    },
    useConfigFiles: true
  })
  await project.write('jest.config.js', `
  module.exports = ${JSON.stringify({
    testMatch: ['custom-test-directory/my.spec.js']
  })}
  `)

  let result
  try {
    await project.run(`vue-cli-service test:unit`)
  } catch (e) {
    result = e
  }
  expect(result.stdout).toMatch('testMatch: custom-test-directory/my.spec.js')
  expect(result.stdout).toMatch('No tests found')
})

test('should work without Babel', async () => {
  const project = await create('jest-without-babel', {
    plugins: {
      '@vue/cli-plugin-unit-jest': {}
    },
    useConfigFiles: true
  })
  await project.run(`vue-cli-service test:unit`)

  await project.run(`vue-cli-service test:unit --coverage --collectCoverageFrom="src/**/*.{js,vue}"`)
  const appCoverage = await project.read('coverage/lcov-report/src/App.vue.html')
  expect(appCoverage).toBeTruthy()
})

test('should work with tsx', async () => {
  const { write, run } = await create('jest-with-tsx', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-typescript': {
        useTsWithBabel: true,
        classComponent: true
      },
      '@vue/cli-plugin-unit-jest': {}
    },
    useConfigFiles: true
  })

  await write('src/components/HelloWorld.tsx', `
  import { Component, Prop, Vue } from 'vue-property-decorator';

  @Component
  export default class HelloWorld extends Vue {
    @Prop() private msg!: string;

    render () {
      return <div>{this.msg}</div>
    }
  }
  `)

  await write('tests/unit/example.spec.ts', `
  import { shallowMount } from '@vue/test-utils'
  import MyComponent from '@/components/HelloWorld'

  describe('HelloWorld.tsx', () => {
    it('renders props.msg when passed', () => {
      const msg = 'new message'
      const wrapper = shallowMount(MyComponent, {
        propsData: { msg }
      })
      expect(wrapper.text()).toMatch(msg)
    })
  })
  `)

  await run(`vue-cli-service test:unit`)
})

test('should correctly configured eslint', async () => {
  const project = await create('unit-jest-eslint', {
    plugins: {
      '@vue/cli-plugin-eslint': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service lint`)
})
