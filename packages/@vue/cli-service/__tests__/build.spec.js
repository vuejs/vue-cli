jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build', async () => {
  const project = await create('e2e-build', defaultPreset)

  // test public copy
  project.write('public/foo.js', '1')
  // make sure that only /public/index.html is skipped (#3119)
  project.write('public/subfolder/index.html', '1')

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/favicon.ico')).toBe(true)
  expect(project.has('dist/js')).toBe(true)
  expect(project.has('dist/css')).toBe(true)
  expect(project.has('dist/foo.js')).toBe(true)
  expect(project.has('dist/subfolder/index.html')).toBe(true)

  const index = await project.read('dist/index.html')

  // should have set the title inferred from the project name
  expect(index).toMatch(/<title>e2e-build<\/title>/)

  // should split and preload app.js & vendor.js
  // expect(index).toMatch(/<link [^>]+js\/app[^>]+\.js" rel="preload" as="script">/)
  // expect(index).toMatch(/<link [^>]+js\/chunk-vendors[^>]+\.js" rel="preload" as="script">/)
  // should preload css
  // expect(index).toMatch(/<link [^>]+app[^>]+\.css" rel="preload" as="style">/)

  // should inject scripts
  expect(index).toMatch(/<script defer="defer" src="\/js\/chunk-vendors\.\w{8}\.js">/)
  expect(index).toMatch(/<script defer="defer" src="\/js\/app\.\w{8}\.js">/)
  // should inject css
  expect(index).toMatch(/<link href="\/css\/app\.\w{8}\.css" rel="stylesheet">/)

  // should reference favicon with correct base URL
  expect(index).toMatch(/<link rel="icon" href="\/favicon.ico">/)

  const port = await portfinder.getPortPromise()
  server = createServer({ root: path.join(project.dir, 'dist') })

  await new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) return reject(err)
      resolve()
    })
  })

  const launched = await launchPuppeteer(`http://localhost:${port}/`)
  browser = launched.browser
  page = launched.page

  const h1Text = await page.evaluate(() => {
    return document.querySelector('h1').textContent
  })

  expect(h1Text).toMatch('Welcome to Your Vue.js App')
})

test('build with --report-json', async () => {
  const project = await create('e2e-build-report-json', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --report-json')
  expect(stdout).toMatch('Build complete.')
  // should generate report.json
  expect(project.has('dist/report.json')).toBe(true)

  const report = JSON.parse(await project.read('dist/report.json'))
  // should contain entry points info
  expect(report.entrypoints).toHaveProperty('app.chunks')
  expect(report.entrypoints).toHaveProperty('app.assets')

  const appChunk = report.chunks.find(chunk => chunk.names.includes('app'))
  // Each chunk should contain meta info
  expect(appChunk).toHaveProperty('rendered')
  expect(appChunk).toHaveProperty('initial')
  expect(appChunk).toHaveProperty('entry')
  expect(appChunk).toHaveProperty('size')
  expect(appChunk).toHaveProperty('names')
  expect(appChunk).toHaveProperty('files')
  expect(appChunk).toHaveProperty('modules')
})

test('build with --dest', async () => {
  const project = await create('e2e-build-dest', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --dest other_dist')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('other_dist/index.html')).toBe(true)
  expect(project.has('other_dist/favicon.ico')).toBe(true)
  expect(project.has('other_dist/js')).toBe(true)
  expect(project.has('other_dist/css')).toBe(true)

  expect(project.has('dist')).toBe(false)
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
