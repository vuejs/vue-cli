jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build', async () => {
  const project = await create('e2e-build', defaultPreset)

  // test public copy
  project.write('public/foo.js', '1')

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/favicon.ico')).toBe(true)
  expect(project.has('dist/js')).toBe(true)
  expect(project.has('dist/css')).toBe(true)
  expect(project.has('dist/foo.js')).toBe(true)

  const index = await project.read('dist/index.html')
  // should split and preload app.js & vendor.js
  expect(index).toMatch(/<link [^>]+js\/app[^>]+\.js rel=preload>/)
  expect(index).toMatch(/<link [^>]+js\/vendors~app[^>]+\.js rel=preload>/)
  // should preload css
  expect(index).toMatch(/<link [^>]+app[^>]+\.css rel=preload>/)

  // should reference favicon with correct base URL
  expect(index).toMatch(/<link rel=icon href=\/favicon.ico>/)

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

afterAll(async () => {
  await browser.close()
  server.close()
})
