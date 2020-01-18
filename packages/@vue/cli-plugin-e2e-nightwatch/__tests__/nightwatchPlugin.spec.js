jest.setTimeout(process.env.APPVEYOR ? 300000 : 120000)

const fs = require('fs-extra')
const path = require('path')
const create = require('@vue/cli-test-utils/createTestProject')
const createServer = require('@vue/cli-test-utils/createServer')

describe('nightwatch e2e plugin', () => {
  let project

  beforeAll(async () => {
    project = await create('e2e-nightwatch', {
      plugins: {
        '@vue/cli-plugin-babel': {},
        '@vue/cli-plugin-e2e-nightwatch': {},
        '@vue/cli-plugin-eslint': {
          config: 'airbnb',
          lintOn: 'save'
        }
      }
    })

    await project.run('vue-cli-service lint')

    await fs.copy(path.join(__dirname, './lib/globals-generated.js'),
      path.join(project.dir, 'tests/e2e/globals-generated.js'))

    const config = {
      globals_path: './tests/e2e/globals-generated.js'
    }
    await project.write('nightwatch.json', JSON.stringify(config))
  })

  test('should run all tests successfully', async () => {
    await project.run(`vue-cli-service test:e2e --headless`)
    let results = await project.read('test_results.json')
    results = JSON.parse(results)
    expect(Object.keys(results.modules)).toEqual([
      'test-with-pageobjects',
      'test'
    ])
  })

  test('should accept the --url cli option', async () => {
    await project.run(`vue-cli-service build`)
    const server = createServer({ root: path.join(project.dir, 'dist') })
    await new Promise((resolve, reject) => {
      server.listen(8080, err => {
        if (err) return reject(err)
        resolve()
      })
    })
    await project.run(`vue-cli-service test:e2e --headless --url http://127.0.0.1:8080/`)
    server.close()

    let results = await project.read('test_results.json')
    results = JSON.parse(results)
    expect(Object.keys(results.modules)).toEqual([
      'test-with-pageobjects',
      'test'
    ])
  })

  test('should run single test with custom nightwatch.json', async () => {
    await project.run(`vue-cli-service test:e2e --headless -t tests/e2e/specs/test.js`)
    let results = await project.read('test_results.json')
    results = JSON.parse(results)
    expect(Object.keys(results.modules)).toEqual([
      'test'
    ])
  })

  test('should run single test with custom nightwatch.json and selenium server', async () => {
    await project.run(`vue-cli-service test:e2e --headless --use-selenium -t tests/e2e/specs/test.js`)
    let results = await project.read('test_results.json')
    results = JSON.parse(results)

    let testSettings = await project.read('test_settings.json')
    testSettings = JSON.parse(testSettings)

    expect(testSettings).toHaveProperty('selenium')
    expect(testSettings.selenium.start_process).toStrictEqual(true)
    expect(testSettings.selenium).toHaveProperty('cli_args')
    expect(Object.keys(results.modules)).toEqual([
      'test'
    ])
  })

  test('should run tests in parallel', async () => {
    await project.run(`vue-cli-service test:e2e --headless --parallel`)
    let results = await project.read('test_results.json')
    results = JSON.parse(results)

    let testSettings = await project.read('test_settings.json')
    testSettings = JSON.parse(testSettings)

    expect(testSettings.parallel_mode).toStrictEqual(true)
    expect(testSettings.test_workers).toStrictEqual(true)

    expect(Object.keys(results.modules).sort()).toEqual([
      'test', 'test-with-pageobjects'
    ])
  })

  // This test requires Firefox to be installed
  const testFn = process.env.APPVEYOR ? test.skip : test
  testFn('should run single test with custom nightwatch.conf.js in firefox', async () => {
    // nightwatch.conf.js take priority over nightwatch.json
    const copyConfig = fs.copy(path.join(__dirname, './lib/nightwatch.conf.js'),
      path.join(project.dir, 'nightwatch.conf.js'))

    const copyGlobals = fs.copy(path.join(__dirname, './lib/globals-gecko.js'),
      path.join(project.dir, 'tests/e2e/globals-gecko.js'))

    await Promise.all([copyConfig, copyGlobals])

    await project.run(`vue-cli-service test:e2e --headless --env firefox -t tests/e2e/specs/test.js`)
    let results = await project.read('test_results_gecko.json')
    results = JSON.parse(results)

    expect(Object.keys(results.modules)).toEqual([
      'test'
    ])
    expect(results.modules.test).toHaveProperty('reportPrefix')
    expect(results.modules.test.reportPrefix).toMatch(/^FIREFOX_.+/)
  })
})
