jest.setTimeout(300000)

const path = require('path')
const { linkBin } = require('@vue/cli/lib/util/linkBin')
const create = require('@vue/cli-test-utils/createTestProject')

const runSilently = fn => {
  const log = console.log
  console.log = () => {}
  const res = fn()
  console.log = log
  return res
}

test('should work', async () => {
  const project = await create('eslint', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  }, null, true /* initGit */)
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)
  // lint
  await run('vue-cli-service lint')
  expect(await read('src/main.js')).toMatch(';')

  // lint-on-commit
  await runSilently(() => {
    require('yorkie/src/install')(path.join(project.dir, 'node_modules'))
    // since yorkie isn't actually installed in the test project, we need to
    // symlink it
    return linkBin(
      path.resolve(require.resolve('yorkie/src/install'), '../../'),
      path.join(project.dir, 'node_modules', 'yorkie')
    )
  })
  const hook = await read('.git/hooks/pre-commit')
  expect(hook).toMatch('#yorkie')
  // add a trivial change to avoid empty changeset after running lint-staged
  await write('src/main.js', updatedMain.replace('false', 'true'))
  // nvm doesn't like PREFIX env
  if (process.platform === 'darwin') {
    delete process.env.PREFIX
  }
  await run('git add -A')
  await run('git commit -m save')
  // should be linted on commit
  expect(await read('src/main.js')).toMatch(';')

  // lint-on-save needs to be tested in a callback
  let done
  const donePromise = new Promise(resolve => {
    done = resolve
  })
  // enable lintOnSave
  await write('vue.config.js', "module.exports = { lintOnSave: 'default' }")
  // write invalid file
  const app = await read('src/App.vue')
  const updatedApp = app.replace(/;/, '')
  await write('src/App.vue', updatedApp)

  const server = run('vue-cli-service serve')

  let isFirstMsg = true
  server.stdout.on('data', data => {
    data = data.toString()
    if (isFirstMsg) {
      // should fail on start
      expect(data).toMatch(/Failed to compile with \d error/)
      isFirstMsg = false

      // fix it
      write('src/App.vue', app)
    } else if (data.match(/Compiled successfully/)) {
      // should compile on the subsequent update
      // (note: in CI environment this may not be the exact 2nd update,
      // so we use data.match as a termination condition rather than a test case)
      server.stdin.write('close')
      done()
    }
  })

  await donePromise
})

test('should not fix with --no-fix option', async () => {
  const project = await create('eslint-nofix', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  })
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)

  // lint with no fix should fail
  try {
    await run('vue-cli-service lint --no-fix')
  } catch (e) {
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }

  // files should not have been fixed
  expect(await read('src/main.js')).not.toMatch(';')
})

// #3167, #3243
test('should not throw when src folder is ignored by .eslintignore', async () => {
  const project = await create('eslint-ignore', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    },
    useConfigFiles: true
  })

  const { write, run } = project
  await write('.eslintignore', 'src\n.eslintrc.js')

  // should not throw
  await run('vue-cli-service lint')
})

test('should save report results to file with --output-file option', async () => {
  const project = await create('eslint-output-file', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'commit'
      }
    }
  })
  const { read, write, run } = project
  // should've applied airbnb autofix
  const main = await read('src/main.js')
  expect(main).toMatch(';')
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)

  // result file name
  const resultsFile = 'lint_results.json'

  try {
    // lint in JSON format to output-file
    await run(`vue-cli-service lint --format json --output-file ${resultsFile} --no-fix`)
  } catch (e) {
    // lint with no fix should fail
    expect(e.code).toBe(1)
    expect(e.failed).toBeTruthy()
  }

  let resultsFileContents = ''

  // results file should exist
  try {
    resultsFileContents = await read(resultsFile)
  } catch (e) {
    expect(e.code).toBe(0)
    expect(e.failed).toBeFalsy()
  }

  // results file should not be empty
  expect(resultsFileContents.length).toBeGreaterThan(0)

  // results file is valid JSON
  try {
    JSON.parse(resultsFileContents)
  } catch (e) {
    expect(e.code).toBe(0)
    expect(e.failed).toBeFalsy()
  }

  // results file should show "Missing semicolon" errors
  expect(resultsFileContents).toEqual(expect.stringContaining('Missing semicolon'))
})

test('should persist cache', async () => {
  const project = await create('eslint-cache', {
    plugins: {
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })

  let done
  const donePromise = new Promise(resolve => {
    done = resolve
  })
  const { has, run } = project
  const server = run('vue-cli-service serve')

  server.stdout.on('data', data => {
    data = data.toString()
    if (data.match(/Compiled successfully/)) {
      server.stdin.write('close')
      done()
    }
  })

  await donePromise

  expect(has('node_modules/.cache/eslint/cache.json')).toBe(true)
})

test.skip(`should use formatter 'stylish'`, async () => {
  const project = await create('eslint-formatter-stylish', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })
  const { read, write, run } = project
  const main = await read('src/main.js')
  expect(main).toMatch(';')

  let done
  const donePromise = new Promise(resolve => {
    done = resolve
  })
  // remove semicolons
  const updatedMain = main.replace(/;/g, '')
  await write('src/main.js', updatedMain)

  const server = run('vue-cli-service serve')

  let output = ''
  server.stdout.on('data', data => {
    output += data.toString()

    if (/webpack compiled with 1 error/.test(output)) {
      expect(output).toMatch(/Failed to compile with \d error/)
      // check the format of output
      // https://eslint.org/docs/user-guide/formatters/#stylish
      // it looks like:
      // ERROR in .../packages/test/eslint-formatter-stylish/src/main.js
      // 1:22  error  Missing semicolon  semi
      expect(output).toMatch(`src${path.sep}main.js`)
      expect(output).toMatch(`error`)
      expect(output).toMatch(`Missing semicolon  semi`)

      server.stdin.write('close')
      done()
    }
  })

  await donePromise
})

test(`should work with eslint args`, async () => {
  const project = await create('eslint-with-args', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })
  const { read, write, run } = project
  await write('src/main.js', `
foo() // Check for apply --global
$('hi!') // Check for apply --env
foo=42
`)
  // result file name
  const resultsFile = 'lint_results.json'
  // lint
  await run(`vue-cli-service lint --ext .js --plugin vue --env jquery --global foo:true --format json --output-file ${resultsFile}`)
  expect(await read('src/main.js')).toMatch(';')

  const resultsContents = JSON.parse(await read(resultsFile))
  const resultForMain = resultsContents.find(({ filePath }) => filePath.endsWith(path.join('src', 'main.js')))
  expect(resultForMain.messages.length).toBe(0)
})
