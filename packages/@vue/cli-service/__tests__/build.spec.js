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
  expect(hasFile('foo.js')).toBe(true)

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
