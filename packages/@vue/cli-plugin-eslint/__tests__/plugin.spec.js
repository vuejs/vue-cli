jest.setTimeout(10000)

const create = require('@vue/cli-test-utils/createTestProjectWithOptions')

test('should work', async () => {
  const { read, write, run } = await create('eslint', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  })
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  await write('src/main.js', main.replace(/;/g, ''))
  // lint
  const child = await run('vue-cli-service lint')
  expect(await read('src/main.js')).toMatch(';')

  // TODO lint-on-commit

  // TODO lint-on-save
})
