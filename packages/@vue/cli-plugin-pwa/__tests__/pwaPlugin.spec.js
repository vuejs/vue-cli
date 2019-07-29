jest.setTimeout(50000)

const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser
test('pwa', async () => {
  // it's ok to mutate here since jest loads each test in a separate vm
  defaultPreset.plugins['@vue/cli-plugin-pwa'] = {}
  const project = await create('pwa-build', defaultPreset)
  expect(project.has('src/registerServiceWorker.js')).toBe(true)

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/favicon.ico')).toBe(true)
  expect(project.has('dist/js')).toBe(true)
  expect(project.has('dist/css')).toBe(true)

  // PWA specific files
  expect(project.has('dist/manifest.json')).toBe(true)
  expect(project.has('dist/img/icons/android-chrome-512x512.png')).toBe(true)

  // Make sure the base preload/prefetch are not affected
  const index = await project.read('dist/index.html')

  // should split and preload app.js & vendor.js
  expect(index).toMatch(/<link [^>]+js\/app[^>]+\.js rel=preload as=script>/)
  expect(index).toMatch(/<link [^>]+js\/chunk-vendors[^>]+\.js rel=preload as=script>/)
  // should preload css
  expect(index).toMatch(/<link [^>]+app[^>]+\.css rel=preload as=style>/)

  // PWA specific directives
  expect(index).toMatch(`<link rel=manifest href=/manifest.json>`)
  // favicon is not minified because it's technically a comment
  expect(index).toMatch(`<!--[if IE]><link rel="icon" href="/favicon.ico"><![endif]-->`)
  expect(index).toMatch(`<meta name=apple-mobile-web-app-capable content=no>`)

  // should import service worker script
  const main = await project.read('src/main.js')
  expect(main).toMatch(`import './registerServiceWorker'`)

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

  // workbox plugin fetches scripts from CDN so it takes a while...
  await new Promise(r => setTimeout(r, process.env.CI ? 5000 : 2000))
  const logs = launched.logs
  expect(logs.some(msg => msg.match(/Content has been cached for offline use/))).toBe(true)
  expect(logs.some(msg => msg.match(/App is being served from cache by a service worker/))).toBe(true)
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
