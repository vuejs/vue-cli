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

test('should handle nested tsconfig.json files', async () => {
  const project = await create('ts-lint-nested-tsconfig', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/main.ts')
  const tsconfig = await read('tsconfig.json')

  // change root tsconfig.json to not include src/**/*.ts
  const updatedTsconfig = tsconfig.replace(/\s+"src\/\*\*\/\*\.ts",/, '')
  await write('tsconfig.json', updatedTsconfig)

  // add nested tsconfig.json which includes **/*.ts files in the src directory
  const nestedTsconfig = `
  {
    "include": [
      "**/*.ts"
    ]
  }
  `
  await write('src/tsconfig.json', nestedTsconfig)

  // update file to not match tslint spec
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.ts', updatedMain)

  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.ts')).toMatch(main)
})

test('should handle nested tslint.json files', async () => {
  const project = await create('ts-lint-nested-tslint', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/main.ts')
  const tslint = await read('tslint.json')

  // add nested tslint.json which expects double quotes
  const updatedTslint = tslint.replace(/single/, 'double')
  await write('src/tslint.json', updatedTslint)

  // update file to use double quotes
  const updatedMain = main.replace(/'/g, '"')
  await write('src/main.ts', updatedMain)

  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.ts')).toMatch(updatedMain)
})

test('should handle tsconfig.json files with extends', async () => {
  const project = await create('ts-lint-extends-tsconfig', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/main.ts')
  const tsconfig = await read('tsconfig.json')

  // change root tsconfig.json to not include src/**/*.ts and to exclude files named main.ts
  const updatedTsconfig = tsconfig
    .replace(/\s+"src\/\*\*\/\*\.ts",/, '')
    .replace(/(\s+)("node_modules",)/, '$1$2\n$1"main.ts"')
  await write('tsconfig.json', updatedTsconfig)

  // add nested tsconfig.json which includes **/*.ts files in the src directory
  const nestedTsconfig = `
  {
    "extends": "../tsconfig",
    "include": [
      "**/*.ts"
    ]
  }
  `
  await write('src/tsconfig.json', nestedTsconfig)

  // update file to not match tslint spec
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.ts', updatedMain)

  // lint
  await run('vue-cli-service lint')
  // the file should be unchanged because the parent tsconfig.json excludes it
  expect(await read('src/main.ts')).toMatch(updatedMain)
})

test('should handle specifying files on the command line', async () => {
  const project = await create('ts-lint-command-line', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        tsLint: true
      }
    }
  })

  const { read, write, run } = project
  const main = await read('src/main.ts')

  // update file to not match tslint spec
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.ts', updatedMain)

  // lint
  await run('vue-cli-service lint src/main.ts')
  expect(await read('src/main.ts')).toMatch(main)

  // re-write the file and lint without specifying src/main.ts
  await write('src/main.ts', updatedMain)
  // lint
  await run('vue-cli-service lint src/App.vue')
  expect(await read('src/main.ts')).toMatch(updatedMain)
})
