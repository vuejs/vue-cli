jest.setTimeout(35000)

const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')
const create = require('@vue/cli-test-utils/createTestProject')

test('base', async () => {
  const { pkg } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {}
  })

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/essential', 'eslint:recommended'
  ])
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
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/essential',
    '@vue/airbnb'
  ])
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
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/essential',
    '@vue/standard'
  ])
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
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/essential',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ])
  expect(pkg.devDependencies).toHaveProperty('eslint-config-prettier')
  expect(pkg.devDependencies).toHaveProperty('eslint-plugin-prettier')
})

test('babel', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'eslint',
      apply: require('../generator'),
      options: {}
    },
    {
      id: 'babel',
      apply: require('@vue/cli-plugin-babel/generator'),
      options: {}
    }
  ])

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.devDependencies).toHaveProperty('@babel/eslint-parser')
  expect(pkg.devDependencies).toHaveProperty('@babel/core')
  expect(pkg.eslintConfig.parserOptions).toEqual({
    parser: '@babel/eslint-parser'
  })
})

test('no-@babel/eslint-parser', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: 'eslint',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(pkg.devDependencies).not.toHaveProperty('@babel/eslint-parser')
  expect(pkg.devDependencies).not.toHaveProperty('@babel/core')
  expect(pkg.eslintConfig.parserOptions).not.toMatchObject({
    parser: '@babel/eslint-parser'
  })
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
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended'
  ])
  expect(pkg.devDependencies).toHaveProperty('eslint-config-prettier')
  expect(pkg.devDependencies).toHaveProperty('eslint-plugin-prettier')
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
    '*.{js,jsx,vue}': 'vue-cli-service lint'
  })
  expect(pkg.vue.lintOnSave).toBe(false)
})

test('should lint ts files when typescript plugin co-exists', async () => {
  const { read } = await create('eslint-lint-ts-files', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        lintOn: 'commit'
      },
      '@vue/cli-plugin-typescript': {}
    }
  }, null, true)
  const pkg = JSON.parse(await read('package.json'))
  expect(pkg).toMatchObject({
    'lint-staged': {
      '*.{js,jsx,vue,ts,tsx}': 'vue-cli-service lint'
    }
  })
})

test('generate .editorconfig for new projects', async () => {
  const { files } = await generateWithPlugin({
    id: 'eslint',
    apply: require('../generator'),
    options: {
      config: 'airbnb'
    }
  })
  expect(files['.editorconfig']).toBeTruthy()
})

test('append to existing .editorconfig', async () => {
  const { dir, read, write } = await create('eslint-editorconfig', {
    plugins: {
      '@vue/cli-plugin-eslint': {}
    }
  }, null, true)
  await write('.editorconfig', 'root = true\n')

  const invoke = require('@vue/cli/lib/invoke')
  await invoke(`eslint`, { config: 'airbnb' }, dir)

  const editorconfig = await read('.editorconfig')
  expect(editorconfig).toMatch('root = true')
  expect(editorconfig).toMatch('[*.{js,jsx,ts,tsx,vue}]')
})

test('airbnb config + typescript + unit-mocha', async () => {
  await create('eslint-airbnb-typescript', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      },
      '@vue/cli-plugin-typescript': {
        classComponent: true
      },
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
}, 30000)

test('typescript + e2e-nightwatch', async () => {
  const { run } = await create('eslint-typescript-nightwatch', {
    plugins: {
      '@vue/cli-plugin-eslint': {},
      '@vue/cli-plugin-typescript': {
        classComponent: true
      },
      '@vue/cli-plugin-e2e-nightwatch': {}
    }
  })
  await run('vue-cli-service lint')
}, 30000)

test('should be able to parse dynamic import syntax', async () => {
  const { run } = await create('eslint-dynamic-import', {
    plugins: {
      '@vue/cli-plugin-eslint': {},
      '@vue/cli-plugin-router': {}
    }
  })
  await run('vue-cli-service lint')
}, 30000)
