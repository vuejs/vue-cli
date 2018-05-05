const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {}
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
    root: true,
    extends: ['plugin:vue/essential', 'eslint:recommended']
  })
})

test('airbnb', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'airbnb'
    }
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
    root: true,
    extends: ['plugin:vue/essential', '@vue/airbnb']
  })
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-airbnb')
})

test('standard', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'standard'
    }
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
    root: true,
    extends: ['plugin:vue/essential', '@vue/standard']
  })
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-standard')
})

test('prettier', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'prettier'
    }
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
    root: true,
    extends: ['plugin:vue/essential', '@vue/prettier']
  })
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-prettier')
})

test('typescript', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'eslint',
      apply: require('../generator'),
      options: {
        config: 'prettier'
      }
    },
    {
      id: 'typescript',
      apply: require('@vue/cli-plugin-typescript/generator'),
      options: {}
    }
  ])

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
    root: true,
    extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript']
  })
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-prettier')
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-typescript')
})

test('lint on save', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      lintOn: 'save'
    }
  })
  // lintOnSave defaults to true so no need for the vue config
  expect(pkg.vue).toBeFalsy()
})

test('lint on commit', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      lintOn: 'commit'
    }
  })
  expect(pkg.gitHooks['pre-commit']).toBe('lint-staged')
  expect(pkg.devDependencies).toHaveProperty('lint-staged')
  expect(pkg['lint-staged']).toEqual({
    '*.js': ['vue-cli-service lint', 'git add'],
    '*.vue': ['vue-cli-service lint', 'git add']
  })
  expect(pkg.vue).toEqual({
    lintOnSave: false
  })
})
