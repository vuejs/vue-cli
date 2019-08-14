jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page
test('build', async () => {
  const project = await create('e2e-build-cors', defaultPreset)

  await project.write('vue.config.js', `
    module.exports = {
      crossorigin: '',
      integrity: true
    }
  `)

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  const index = await project.read('dist/index.html')

  // preload disabled due to chrome bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=677022
  // expect(index).toMatch(/<link [^>]+js\/app[^>]+\.js rel=preload as=script crossorigin>/)
  // expect(index).toMatch(/<link [^>]+js\/chunk-vendors[^>]+\.js rel=preload as=script crossorigin>/)
  // expect(index).toMatch(/<link [^>]+app[^>]+\.css rel=preload as=style crossorigin>/)

  // should apply crossorigin and add integrity to scripts and css
  expect(index).toMatch(/<script src=\/js\/chunk-vendors\.\w{8}\.js crossorigin integrity=sha384-.{64}\s?>/)
  expect(index).toMatch(/<script src=\/js\/app\.\w{8}\.js crossorigin integrity=sha384-.{64}\s?>/)
  expect(index).toMatch(/<link href=\/css\/app\.\w{8}\.css rel=stylesheet crossorigin integrity=sha384-.{64}\s?>/)

  // verify integrity is correct by actually running it
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
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
