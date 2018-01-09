jest.setTimeout(30000)

const fs = require('fs')
const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaults } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page

test('serve', async () => {
  const project = await create('e2e-build', defaults)

  // test public copy
  project.write('public/foo.js', '1')

  const { stdout } = await project.run('vue-cli-service build')

  expect(stdout).toMatch('Build complete.')

  const distDir = path.join(project.dir, 'dist')
  const hasFile = file => fs.existsSync(path.join(distDir, file))
  expect(hasFile('index.html')).toBe(true)
  expect(hasFile('favicon.ico')).toBe(true)
  expect(hasFile('static/js')).toBe(true)
  expect(hasFile('static/css')).toBe(true)
  expect(hasFile('foo.js')).toBe(true)

  const index = await project.read('dist/index.html')
  // should split and preload app.js & vendor.js
  expect(index).toMatch(/<link rel=preload [^>]+app[^>]+\.js>/)
  expect(index).toMatch(/<link rel=preload [^>]+vendor[^>]+\.js>/)
  // should not preload manifest because it's inlined
  expect(index).not.toMatch(/<link rel=preload [^>]+manifest[^>]+\.js>/)
  // should inline manifest and wepback runtime
  expect(index).toMatch('window.webpackJsonp=')

  const port = await portfinder.getPortPromise()
  server = createServer({ root: distDir })

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

  await browser.close()
  server.close()
  browser = server = null
})

afterAll(async () => {
  if (browser) await browser.close()
  if (server) server.close()
})
