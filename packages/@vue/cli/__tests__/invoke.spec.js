jest.setTimeout(12000)
jest.mock('inquirer')

const invoke = require('../lib/invoke')
const { expectPrompts } = require('inquirer')
const create = require('@vue/cli-test-utils/createTestProject')

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

  const eslintrc = JSON.parse(await project.read('.eslintrc'))
  expect(eslintrc).toEqual({
    root: true,
    extends: ['plugin:vue/essential', '@vue/airbnb']
  })

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

test('invoke with existing files', async () => {
  const project = await create(`invoke-existing`, {
    useConfigFiles: true,
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': { config: 'base' }
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-eslint'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  // mock existing vue.config.js
  await project.write('vue.config.js', `module.exports = { lintOnSave: true }`)

  const eslintrc = JSON.parse(await project.read('.eslintrc'))
  expect(eslintrc).toEqual({
    root: true,
    extends: ['plugin:vue/essential', 'eslint:recommended']
  })

  await project.run(`${require.resolve('../bin/vue')} invoke eslint --config airbnb --lintOn commit`)

  await assertUpdates(project)
  const updatedVueConfig = await project.read('vue.config.js')
  expect(updatedVueConfig).toMatch(`module.exports = { lintOnSave: false }`)
})

test('invoke with existing files (yaml)', async () => {
  const project = await create(`invoke-existing`, {
    useConfigFiles: true,
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': { config: 'base' }
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-eslint'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  const eslintrc = JSON.parse(await project.read('.eslintrc'))
  expect(eslintrc).toEqual({
    root: true,
    extends: ['plugin:vue/essential', 'eslint:recommended']
  })

  await project.rm(`.eslintrc`)
  await project.write(`.eslintrc.yml`, `
root: true
extends:
  - 'plugin:vue/essential'
  - 'eslint:recommended'
  `.trim())

  await project.run(`${require.resolve('../bin/vue')} invoke eslint --config airbnb`)

  const updated = await project.read('.eslintrc.yml')
  expect(updated).toMatch(`
root: true
extends:
  - 'plugin:vue/essential'
  - '@vue/airbnb'
`.trim())
})
