const create = require('@vue/cli-test-utils/createTestProjectWithOptions')

it('should work', async () => {
  const { read, write, exec } = await create('eslint', {
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
  expect(main).toContain(';')
  // remove semicolons
  await write('src/main.js', main.replace(/;/g, ''))
  // lint
  await exec('node ./node_modules/.bin/vue-cli-service lint')
  expect(await read('src/main.js')).toContain(';')

  // TODO lint-on-commit

  // TODO lint-on-save
})
