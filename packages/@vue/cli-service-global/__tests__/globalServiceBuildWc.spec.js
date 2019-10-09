jest.setTimeout(20000)

const fs = require('fs-extra')
const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const execa = require('execa')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

const cwd = path.resolve(__dirname, 'temp')
const binPath = require.resolve('@vue/cli/bin/vue')
const write = (file, content) => fs.writeFile(path.join(cwd, file), content)

const entryVue = fs.readFileSync(path.resolve(__dirname, 'entry.vue'), 'utf-8')

beforeAll(async () => {
  await fs.ensureDir(cwd)
  await write('my-wc.vue', entryVue)
})

let server, browser, page
test('global build --target wc', async () => {
  const { stdout } = await execa(binPath, ['build', 'my-wc.vue', '--target', 'wc'], { cwd })

  expect(stdout).toMatch('Build complete.')

  const distDir = path.join(cwd, 'dist')
  const hasFile = file => fs.existsSync(path.join(distDir, file))
  expect(hasFile('demo.html')).toBe(true)
  expect(hasFile('my-wc.js')).toBe(true)
  expect(hasFile('my-wc.min.js')).toBe(true)

  const port = await portfinder.getPortPromise()
  server = createServer({ root: distDir })

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
    return document.querySelector('my-wc').shadowRoot.querySelector('h1').textContent
  })

  expect(h1Text).toMatch('hi')
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
