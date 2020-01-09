jest.setTimeout(30000)

const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
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

  const h3Text = await page.evaluate(() => {
    return document.querySelector('build-wc-hello-world').shadowRoot.querySelector('h3').textContent
  })
  expect(h3Text).toMatch('Installed CLI Plugins')
})

test('build as single wc', async () => {
  const project = await create('build-single-wc', defaultPreset)

  const { stdout } = await project.run(`vue-cli-service build --target wc --name single-wc`)
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/single-wc.js')).toBe(true)
  expect(project.has('dist/single-wc.min.js')).toBe(true)

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
    return document.querySelector('single-wc').shadowRoot.querySelectorAll('style').length
  })
  expect(styleCount).toBe(2) // should contain styles from both app and child

  const h1Text = await page.evaluate(() => {
    return document.querySelector('single-wc').shadowRoot.querySelector('h1').textContent
  })
  expect(h1Text).toMatch('Welcome to Your Vue.js App')
})

test('build as wc with --inline-vue', async () => {
  const project = await create('build-wc-inline-vue', defaultPreset)

  await project.write('src/main-wc.js', `
    import Vue from 'vue'
    import App from "./components/App.vue"

    document.addEventListener("DOMContentLoaded", function() {
      new Vue({
        render: h => h(App),
      }).$mount('body');
    });
  `)

  await project.write('src/components/App.vue', `
    <template>
      <div>{{ message }}<div>
    </template>
    <script>
      export default {
        data() {
          return {
            message: 'Hello from Wc'
          }
        },
      }
    </script>
  `)

  const { stdout } = await project.run('vue-cli-service build --target wc --inline-vue --name single-wc src/main-wc.js')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/single-wc.js')).toBe(true)
  expect(project.has('dist/single-wc.min.js')).toBe(true)

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
  const divText = await page.evaluate(() => {
    return document.querySelector('div').textContent
  })
  expect(divText).toMatch('Hello from Wc')
})

afterEach(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
