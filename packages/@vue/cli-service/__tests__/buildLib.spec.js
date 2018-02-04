jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build as lib', async () => {
  const project = await create('build-lib', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --target lib --name testLib src/components/HelloWorld.vue')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/testLib.common.js')).toBe(true)
  expect(project.has('dist/testLib.umd.js')).toBe(true)
  expect(project.has('dist/testLib.umd.min.js')).toBe(true)
  expect(project.has('dist/testLib.css')).toBe(true)

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

  const h1Text = await page.evaluate(() => {
    return document.querySelector('h1').textContent
  })
  expect(h1Text).toMatch('') // no props given

  const h3Text = await page.evaluate(() => {
    return document.querySelector('h3').textContent
  })
  expect(h3Text).toMatch('Installed CLI Plugins')
})

afterAll(async () => {
  await browser.close()
  server.close()
})
