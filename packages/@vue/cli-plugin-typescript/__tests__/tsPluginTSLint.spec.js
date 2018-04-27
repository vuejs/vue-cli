jest.setTimeout(10000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-lint', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
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
  // test if tslint is fixing vue files properly
  expect(lintedApp).toBe(app)
})

test('should not fix with --no-fix option', async () => {
  const project = await create('ts-lint-nofix', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
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

  // lint with no fix should fail
  try {
    await run('vue-cli-service lint --no-fix')
  } catch (e) {
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }

  // files should not have been fixed
  expect(await read('src/main.ts')).not.toMatch(';')
  expect((await read('src/App.vue')).match(/<script(.|\n)*\/script>/)[1]).not.toMatch(';')
})
