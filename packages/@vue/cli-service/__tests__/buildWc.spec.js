jest.setTimeout(15000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build as wc', async () => {
  const project = await create('build-wc', defaultPreset)

  const { stdout } = await project.run(`vue-cli-service build --target wc **/*.vue`)
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/build-wc.js')).toBe(true)
  expect(project.has('dist/build-wc.min.js')).toBe(true)

  const port = await portfinder.getPortPromise()
  server = createServer({ root: path.join(project.dir, 'dist') })

  await new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) return reject(err)
      resolve()
    })
  })

  const launched = await launchPuppeteer(`http://localhost:${port}/demo.html`)
  browser = launched.browser
  page = launched.page

  const styleCount = await page.evaluate(() => {
    return document.querySelector('build-wc-app').shadowRoot.querySelectorAll('style').length
  })
  expect(styleCount).toBe(2) // should contain styles from both app and child

  const h1Text = await page.evaluate(() => {
    return document.querySelector('build-wc-app').shadowRoot.querySelector('h1').textContent
  })
  expect(h1Text).toMatch('Welcome to Your Vue.js App')

  const childStyleCount = await page.evaluate(() => {
    return document.querySelector('build-wc-hello-world').shadowRoot.querySelectorAll('style').length
  })
  expect(childStyleCount).toBe(1)

  const h2Text = await page.evaluate(() => {
    return document.querySelector('build-wc-hello-world').shadowRoot.querySelector('h2').textContent
  })
  expect(h2Text).toMatch('Essential Links')
})

afterAll(async () => {
  await browser.close()
  server.close()
})
