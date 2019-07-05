jest.setTimeout(50000)

const fs = require('fs-extra')
const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser
test('modern mode', async () => {
  const project = await create('modern-mode', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --modern')
  expect(stdout).toMatch('Build complete.')

  // assert correct bundle files
  const files = await fs.readdir(path.join(project.dir, 'dist/js'))
  expect(files.some(f => /^app\.\w{8}\.js$/.test(f))).toBe(true)
  expect(files.some(f => /^app-legacy\.\w{8}\.js$/.test(f))).toBe(true)
  expect(files.some(f => /^chunk-vendors\.\w{8}\.js$/.test(f))).toBe(true)
  expect(files.some(f => /^chunk-vendors-legacy\.\w{8}\.js$/.test(f))).toBe(true)

  // arrow function should be reserved in the modern build
  const app = await project.read(`dist/js/${files.find(f => /^app\.\w{8}\.js$/.test(f))}`)
  expect(app).toMatch(/=>/)
  const legacyApp = await project.read(`dist/js/${files.find(f => /^app-legacy\.\w{8}\.js$/.test(f))}`)
  expect(legacyApp).not.toMatch(/=>/)

  // assert correct asset links
  const index = await project.read('dist/index.html')

  // should use <script type="module" crossorigin=use-credentials> for modern bundle
  expect(index).toMatch(/<script type=module src=\/js\/chunk-vendors\.\w{8}\.js>/)
  expect(index).toMatch(/<script type=module src=\/js\/app\.\w{8}\.js>/)

  // should use <link rel="modulepreload" crossorigin=use-credentials> for modern bundle
  expect(index).toMatch(/<link [^>]*js\/chunk-vendors\.\w{8}\.js rel=modulepreload as=script>/)
  expect(index).toMatch(/<link [^>]*js\/app\.\w{8}\.js rel=modulepreload as=script>/)

  // should use <script nomodule> for legacy bundle
  expect(index).toMatch(/<script src=\/js\/chunk-vendors-legacy\.\w{8}\.js nomodule>/)
  expect(index).toMatch(/<script src=\/js\/app-legacy\.\w{8}\.js nomodule>/)

  // should inject Safari 10 nomodule fix
  const { safariFix } = require('../lib/webpack/ModernModePlugin')
  expect(index).toMatch(`<script>${safariFix}</script>`)

  // Test crossorigin="use-credentials"
  await project.write('vue.config.js', `module.exports = { crossorigin: 'use-credentials' }`)
  const { stdout: stdout2 } = await project.run('vue-cli-service build --modern')
  expect(stdout2).toMatch('Build complete.')
  const index2 = await project.read('dist/index.html')
  // should use <script type="module" crossorigin=use-credentials> for modern bundle
  expect(index2).toMatch(/<script type=module src=\/js\/chunk-vendors\.\w{8}\.js crossorigin=use-credentials>/)
  expect(index2).toMatch(/<script type=module src=\/js\/app\.\w{8}\.js crossorigin=use-credentials>/)
  // should use <link rel="modulepreload" crossorigin=use-credentials> for modern bundle
  expect(index2).toMatch(/<link [^>]*js\/chunk-vendors\.\w{8}\.js rel=modulepreload as=script crossorigin=use-credentials>/)
  expect(index2).toMatch(/<link [^>]*js\/app\.\w{8}\.js rel=modulepreload as=script crossorigin=use-credentials>/)

  // start server and ensure the page loads properly
  const port = await portfinder.getPortPromise()
  server = createServer({ root: path.join(project.dir, 'dist') })

  await new Promise((resolve, reject) => {
    server.listen(port, err => {
      if (err) return reject(err)
      resolve()
    })
  })

  const url = `http://localhost:${port}/`
  const launched = await launchPuppeteer(url)
  browser = launched.browser
  const page = launched.page

  const getH1Text = async () => page.evaluate(() => {
    return document.querySelector('h1').textContent
  })

  expect(await getH1Text()).toMatch('Welcome to Your Vue.js App')
})

test('no-unsafe-inline', async () => {
  const project = await create('no-unsafe-inline', defaultPreset)

  const { stdout } = await project.run('vue-cli-service build --modern --no-unsafe-inline')
  expect(stdout).toMatch('Build complete.')

  // should output a separate safari-nomodule-fix bundle
  const files = await fs.readdir(path.join(project.dir, 'dist/js'))
  expect(files.some(f => /^safari-nomodule-fix\.js$/.test(f))).toBe(true)

  // should contain no inline scripts in the output html
  const index = await project.read('dist/index.html')
  expect(index).not.toMatch(/[^>]\s*<\/script>/)
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
