jest.setTimeout(300000)

const create = require('@vue/cli-test-utils/createUpgradableProject')

test('upgrade: should add eslint to devDependencies', async () => {
  const project = await create('plugin-eslint-v3.0', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.0.0'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies).not.toHaveProperty('eslint')

  await project.upgrade('eslint')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies.eslint).toMatch('^7')
})

test('upgrade: should upgrade eslint from v5 to v7', async () => {
  const project = await create('plugin-eslint-with-eslint-5', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies.eslint).toMatch('^5')

  try {
    await project.upgrade('eslint')
  } catch (e) {
    // TODO:
    // Currently the `afterInvoke` hook will fail,
    // because deps are not correctly installed in test env.
    // Need to fix later.
  }

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies.eslint).toMatch('^7')
  expect(updatedPkg.devDependencies).toHaveProperty('eslint-plugin-import')
})

test.each([['3.12.1'], ['4.5.8']])('upgrade: replace babel-eslint with @babel/eslint-parser', async (version) => {
  const project = await create('plugin-eslint-replace-babel-eslint' + version[0], {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version,
        config: 'airbnb'
      },
      '@vue/cli-plugin-babel': {
        version,
        config: 'airbnb'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies).toHaveProperty('babel-eslint')
  expect(pkg.devDependencies).not.toHaveProperty('@babel/core')
  expect(pkg.eslintConfig).toMatchObject({
    parserOptions: {
      parser: 'babel-eslint'
    }
  })
  pkg.eslintConfig.parserOptions.testMerge = 'testMerge'
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  const eslintConfigBefore = pkg.eslintConfig

  await project.upgrade('eslint')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.eslintConfig).toMatchObject({
    ...eslintConfigBefore,
    parserOptions: {
      testMerge: 'testMerge',
      parser: '@babel/eslint-parser'
    }
  })
  expect(updatedPkg.devDependencies['@babel/eslint-parser']).toMatch('^7')
  expect(updatedPkg.devDependencies).not.toHaveProperty('babel-eslint')
  expect(updatedPkg.devDependencies).toHaveProperty('@babel/core')
})

test('upgrade: not add @babel/eslint-parser without babel', async () => {
  const project = await create('plugin-eslint-not-replace-babel-eslint', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  await project.upgrade('eslint')

  const updatedPkg = await project.read('package.json')
  expect(updatedPkg).not.toMatch('@babel/eslint-parser')
  expect(updatedPkg).not.toMatch('@babel/core')
  expect(JSON.parse(updatedPkg).devDependencies.eslint).toMatch('^7')
})

test('upgrade: not add @babel/eslint-parser with ts', async () => {
  const project = await create('plugin-eslint-not-add-babel-eslint-ts', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      },
      '@vue/cli-plugin-typescript': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  await project.upgrade('eslint')

  const updatedPkg = await project.read('package.json')
  expect(updatedPkg).not.toMatch('@babel/eslint-parser')
  expect(updatedPkg).not.toMatch('@babel/core')
  expect(updatedPkg).toMatch('@typescript-eslint/parser')
  expect(JSON.parse(updatedPkg).devDependencies.eslint).toMatch('^7')
})

test('upgrade: replace babel-eslint with @babel/eslint-parser in eslintrc.js', async () => {
  const project = await create('plugin-eslint-replace-babel-eslint-eslintrc', {
    useConfigFiles: true,
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      },
      '@vue/cli-plugin-babel': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  const eslintrc = await project.read('.eslintrc.js')
  expect(eslintrc).toMatch('babel-eslint')
  const eslintrcMerge = eslintrc.replace(`parser: 'babel-eslint'`, `testMerge: 'testMerge', parser: 'babel-eslint'`)
  await project.write('.eslintrc.js', eslintrcMerge)

  await project.upgrade('eslint')

  const updatedEslintrc = await project.read('.eslintrc.js')
  expect(updatedEslintrc).toMatch('@babel/eslint-parser')
  expect(updatedEslintrc).toMatch('testMerge')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies).not.toHaveProperty('babel-eslint')
  expect(updatedPkg.devDependencies.eslint).toMatch('^7')
})

test.each([
  ['7.1.0', true],
  ['7.2.0', false]
])('upgrade: local @babel/core exists', async (localBabelCoreVersion, bumpVersion) => {
  const project = await create('plugin-eslint-core-' + String(bumpVersion), {
    plugins: {
      '@vue/cli-plugin-eslint': {
        version: '3.12.1',
        config: 'airbnb'
      },
      '@vue/cli-plugin-babel': {
        version: '3.12.1',
        config: 'airbnb'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@babel/core'] = localBabelCoreVersion
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  await project.upgrade('eslint')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.devDependencies['@babel/core'] !== localBabelCoreVersion).toBe(bumpVersion)
})
