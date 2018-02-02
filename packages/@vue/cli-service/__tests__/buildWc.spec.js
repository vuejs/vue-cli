jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build as single wc', async () => {
  const project = await create('build-wc', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --target wc src/components/HelloWorld.vue')
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
    return document.querySelector('build-wc')._shadowRoot.querySelectorAll('style').length
  })
  expect(styleCount).toBe(1)

  await page.evaluate(() => {
    document.querySelector('build-wc').msg = 'hello'
  })
  const h1Text = await page.evaluate(() => {
    return document.querySelector('build-wc')._shadowRoot.querySelector('h1').textContent
  })
  expect(h1Text).toBe('hello')
})

afterAll(async () => {
  await browser.close()
  server.close()
})
