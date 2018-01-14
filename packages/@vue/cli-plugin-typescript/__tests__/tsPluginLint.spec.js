jest.setTimeout(10000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-lint', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        lint: true
      }
    }
  })
  const { read, write, run } = project
  const main = await read('src/main.ts')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.ts', updatedMain)
  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.ts')).toMatch(';')
})
