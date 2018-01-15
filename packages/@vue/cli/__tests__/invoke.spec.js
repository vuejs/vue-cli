require('../lib/invoke') // so that jest registers the file for this test
const create = require('@vue/cli-test-utils/createTestProject')

test('invoke single generator', async () => {
  const project = await create('invoke', {
    plugins: {
      '@vue/cli-plugin-babel': {}
    }
  })
  // mock install
  const pkg = JSON.parse(await project.read('package.json'))
  pkg.devDependencies['@vue/cli-plugin-eslint'] = '*'
  await project.write('package.json', JSON.stringify(pkg, null, 2))

  const cliBinPath = require.resolve('../bin/vue')
  await project.run(`${cliBinPath} invoke eslint --config airbnb --lintOn save,commit`)

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.scripts.lint).toBe('vue-cli-service lint')
  expect(updatedPkg.devDependencies).toHaveProperty('eslint-plugin-vue')
  expect(updatedPkg.devDependencies).toHaveProperty('lint-staged')
  expect(updatedPkg.eslintConfig).toEqual({
    extends: ['plugin:vue/essential', '@vue/airbnb']
  })
  expect(updatedPkg.gitHooks).toEqual({
    'pre-commit': 'lint-staged'
  })

  const lintedMain = await project.read('src/main.js')
  expect(lintedMain).toMatch(';') // should've been linted in post-generate hook
})
