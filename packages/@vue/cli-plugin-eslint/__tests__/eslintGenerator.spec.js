const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {}
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig).toEqual({
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
    extends: ['plugin:vue/essential', '@vue/prettier']
  })
  expect(pkg.devDependencies).toHaveProperty('@vue/eslint-config-prettier')
})

test('lint on save', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      lintOn: 'save'
    }
  })

  expect(pkg.vue).toEqual({
    lintOnSave: true
  })
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
})
