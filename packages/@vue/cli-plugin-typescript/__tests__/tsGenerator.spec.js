const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('generate files', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'core',
      apply: require('@vue/cli-service/generator'),
      options: {}
    },
    {
      id: 'ts',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/main.ts']).toBeTruthy()
  expect(files['src/main.js']).toBeFalsy()
  expect(files['src/App.vue']).toMatch('<script lang="ts">')
})

test('classComponent', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        classComponent: true
      }
    }
  ])

  expect(pkg.dependencies).toHaveProperty('vue-class-component')
  expect(pkg.dependencies).toHaveProperty('vue-property-decorator')

  expect(files['tsconfig.json']).toMatch(`"experimentalDecorators": true`)
  expect(files['tsconfig.json']).toMatch(`"emitDecoratorMetadata": true`)
  expect(files['src/App.vue']).toMatch(
    `export default class App extends Vue {`
  )
  expect(files['src/components/HelloWorld.vue']).toMatch(
    `export default class HelloWorld extends Vue {`
  )
})

test('use with Babel', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'babel',
      apply: require('@vue/cli-plugin-babel/generator'),
      options: {}
    },
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        useTsWithBabel: true
      }
    }
  ])

  expect(pkg.babel).toEqual({ presets: ['@vue/app'] })
  expect(files['tsconfig.json']).toMatch(`"target": "esnext"`)
})

test('lint', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        tsLint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.scripts.lint).toBe(`vue-cli-service lint`)
  expect(pkg.devDependencies).toHaveProperty('lint-staged')
  expect(pkg.gitHooks).toEqual({ 'pre-commit': 'lint-staged' })
  expect(pkg['lint-staged']).toEqual({
    '*.ts': ['vue-cli-service lint', 'git add'],
    '*.vue': ['vue-cli-service lint', 'git add']
  })

  expect(files['tslint.json']).toBeTruthy()
})

test('lint with no lintOnSave', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        tsLint: true,
        lintOn: ['commit']
      }
    }
  ])
  expect(pkg.vue).toEqual({ lintOnSave: false })
})

test('tsconfig.json should be valid json', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'ts',
      apply: require('../generator'),
      options: {}
    }
  ])
  expect(() => {
    JSON.parse(files['tsconfig.json'])
  }).not.toThrow()
})

test('compat with unit-mocha', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: '@vue/cli-plugin-unit-mocha',
      apply: () => {},
      options: {}
    },
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        lint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.devDependencies).toHaveProperty('@types/mocha')
  expect(pkg.devDependencies).toHaveProperty('@types/chai')
})

test('compat with unit-jest', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: '@vue/cli-plugin-unit-jest',
      apply: () => {},
      options: {}
    },
    {
      id: 'ts',
      apply: require('../generator'),
      options: {
        lint: true,
        lintOn: ['save', 'commit']
      }
    }
  ])

  expect(pkg.devDependencies).toHaveProperty('@types/jest')
})
