jest.setTimeout(60000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-eslint', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'prettier'
      },
      '@vue/cli-plugin-typescript': {
        classComponent: true
      }
    }
  })
  const { read, write, run } = project
  const main = await read('src/main.ts')
  expect(main).toMatch(';')
  const app = await read('src/App.vue')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.ts', updatedMain)
  // for Vue file, only remove semis in script section
  const updatedApp = app.replace(/<script(.|\n)*\/script>/, $ => {
    return $.replace(/;/g, '')
  })
  await write('src/App.vue', updatedApp)
  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.ts')).toMatch(';')

  const lintedApp = await read('src/App.vue')
  expect(lintedApp).toMatch(';')
  // test if ESLint is fixing vue files properly
  expect(lintedApp).toBe(app)
})
