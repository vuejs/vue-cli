jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build as lib', async () => {
  const project = await create('e2e-build-lib', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --traget lib --name testLib')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/favicon.ico')).toBe(true)
  expect(project.has('dist/js')).toBe(true)
  expect(project.has('dist/css')).toBe(true)

  const index = await project.read('dist/index.html')
  // should preload app.js & vendor.js
  expect(index).toMatch(/<link rel=preload [^>]+app[^>]+\.js>/)
  expect(index).toMatch(/<link rel=preload [^>]+vendor[^>]+\.js>/)

  const vendorFile = index.match(/<link rel=preload [^>]+(vendor[^>]+\.js)>/)[1]
  const vendor = await project.read(`dist/js/${vendorFile}`)
  expect(vendor).toMatch(`router-link`)
  expect(vendor).toMatch(`vuex`)

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
