jest.setTimeout(10000)
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
  expect(updatedPkg.eslintConfig).toEqual({
    extends: ['plugin:vue/essential', '@vue/airbnb']
  })
  expect(updatedPkg.gitHooks).toEqual({
    'pre-commit': 'lint-staged'
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
