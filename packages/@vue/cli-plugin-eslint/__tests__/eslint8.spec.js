jest.setTimeout(300000)

const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

// This test must be run in the E2E environment (with a local registry).
// Because the installation of ESLint v8 will break the test environment of the project
test(`should work with eslint v8`, async () => {
  const project = await createOutside('eslint-v8', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })
  const { read, write, run } = project
  await run('yarn add -D eslint@8')
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)
  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.js')).toMatch(';')
})
