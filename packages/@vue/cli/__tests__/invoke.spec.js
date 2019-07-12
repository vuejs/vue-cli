jest.setTimeout(20000)
jest.mock('inquirer')

const invoke = require('../lib/invoke')
const { expectPrompts } = require('inquirer')
const create = require('@vue/cli-test-utils/createTestProject')

const parseJS = file => {
  const res = {}
  ;(new Function('module', file))(res)
  return res.exports
}

const baseESLintConfig = Object.assign({}, require('@vue/cli-plugin-eslint/eslintOptions').config({
  hasPlugin: () => false
}), {
  rules: {
    'no-console': 'off',
    'no-debugger': 'off'
  }
})

async function createAndInstall (name) {
  const project = await create(name, {
    plugins: {
      '@vue/cli-plugin-babel': {}
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-eslint'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  return project
}

async function assertUpdates (project) {
  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.scripts.lint).toBe('vue-cli-service lint')
  expect(updatedPkg.devDependencies).toHaveProperty('lint-staged')
  expect(updatedPkg.gitHooks).toEqual({
    'pre-commit': 'lint-staged'
  })

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['plugin:vue/essential', '@vue/airbnb']
  }))

  const lintedMain = await project.read('src/main.js')
  expect(lintedMain).toMatch(';') // should've been linted in post-generate hook
}

test('invoke with inline options', async () => {
  const project = await createAndInstall(`invoke-inline`)
  await project.run(`${require.resolve('../bin/vue')} invoke eslint --config airbnb --lintOn save,commit`)
  await assertUpdates(project)
})

test('invoke with prompts', async () => {
  const project = await createAndInstall(`invoke-prompts`)
  expectPrompts([
    {
      message: `Pick an ESLint config`,
      choices: [`Error prevention only`, `Airbnb`, `Standard`, `Prettier`],
      choose: 1
    },
    {
      message: `Pick additional lint features`,
      choices: [`on save`, 'on commit'],
      check: [0, 1]
    }
  ])
  // need to be in the same process to have inquirer mocked
  // so calling directly
  await invoke(`eslint`, {}, project.dir)
  await assertUpdates(project)
})

test('invoke with ts', async () => {
  const project = await create(`invoke-existing`, {
    useConfigFiles: true,
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': { config: 'base' }
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-typescript'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  // mock existing vue.config.js
  await project.write('vue.config.js', `module.exports = { lintOnSave: 'default' }`)

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['plugin:vue/essential', 'eslint:recommended']
  }))

  await project.run(`${require.resolve('../bin/vue')} invoke typescript --classComponent --useTsWithBabel`)

  const updatedESLintrc = parseJS(await project.read('.eslintrc.js'))
  expect(updatedESLintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/typescript'],
    parserOptions: {
      parser: '@typescript-eslint/parser'
    }
  }))
})

test('invoke with existing files (yaml)', async () => {
  const project = await create(`invoke-existing-yaml`, {
    useConfigFiles: true,
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {}
    }
  })

  const eslintrc = parseJS(await project.read('.eslintrc.js'))
  expect(eslintrc).toEqual(Object.assign({}, baseESLintConfig, {
    extends: ['plugin:vue/essential', 'eslint:recommended']
  }))

  await project.rm(`.eslintrc.js`)
  await project.write(`.eslintrc.yml`, `
root: true
extends:
  - 'plugin:vue/essential'
  - 'eslint:recommended'
  `.trim())

  await project.run(`${require.resolve('../bin/vue')} invoke eslint --config airbnb`)

  const updated = await project.read('.eslintrc.yml')
  expect(updated).toMatch(`
extends:
  - 'plugin:vue/essential'
  - 'eslint:recommended'
  - '@vue/airbnb'
`.trim())
})

test('invoking a plugin that renames files', async () => {
  const project = await create(`invoke-rename`, { plugins: {}})
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-typescript'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))
  await project.run(`${require.resolve('../bin/vue')} invoke typescript -d`)
  expect(project.has('src/main.js')).toBe(false)
})

test('should prompt if invoking in a git repository with uncommited changes', async () => {
  delete process.env.VUE_CLI_SKIP_DIRTY_GIT_PROMPT
  const project = await create('invoke-dirty', {
    plugins: {
      '@vue/cli-plugin-babel': {}
    }
  })
  await project.write('some-random-file', '')
  expectPrompts([
    {
      message: `Still proceed?`,
      confirm: true
    }
  ])
  await invoke(`babel`, {}, project.dir)
})
