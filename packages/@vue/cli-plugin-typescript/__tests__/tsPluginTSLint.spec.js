jest.setTimeout(30000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-tslint', {
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
  const project = await create('ts-tslint-nofix', {
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

test('should ignore issues in node_modules', async () => {
  const project = await create('ts-lint-node_modules', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/main.ts')

  // update file to not match tslint spec and dump it into the node_modules directory
  const updatedMain = main.replace(/;/g, '')
  await write('node_modules/bad.ts', updatedMain)

  // lint
  await run('vue-cli-service lint')
  expect(await read('node_modules/bad.ts')).toMatch(updatedMain)
})

test('should be able to fix mixed line endings', async () => {
  const project = await create('ts-lint-mixed-line-endings', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { write, run } = project

  const b64 = 'PHRlbXBsYXRlPjwvdGVtcGxhdGU+DQoNCjxzY3JpcHQgbGFuZz0idHMiPg0KZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdCAgew0KICBnZXQgYXNzaWduZWUoKSB7DQogICAgdmFyIGl0ZW1zOnt0ZXh0OnN0cmluZzsgdmFsdWU6c3RyaW5nIHwgbnVtYmVyIHwgbnVsbH1bXSA9IFtdOw0KICAgIHJldHVybiBpdGVtczsNCiAgfQ0KDQp9DQo8L3NjcmlwdD4NCg0K'
  const buf = Buffer.from(b64, 'base64')

  await write('src/bad.vue', buf)

  // Try twice to fix the file.
  // For now, it will fail the first time, which corresponds to the behaviour of tslint.
  try {
    await run('vue-cli-service lint -- src/bad.vue')
  } catch (e) { }

  await run('vue-cli-service lint -- src/bad.vue')
})
