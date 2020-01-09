jest.setTimeout(80000)

const fs = require('fs-extra')
const path = require('path')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const execa = require('execa')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

const cwd = path.resolve(__dirname, 'temp')
const binPath = require.resolve('@vue/cli/bin/vue')
const write = (file, content) => fs.writeFile(path.join(cwd, file), content)

const entryVue = fs.readFileSync(path.resolve(__dirname, 'entry.vue'), 'utf-8')

const entryJs = `
import Vue from 'vue'
import App from './Other.vue'

new Vue({ render: h => h(App) }).$mount('#app')
`.trim()

beforeEach(async () => {
  await fs.ensureDir(cwd)
  await write('App.vue', entryVue)
  await write('Other.vue', entryVue)
  await write('foo.js', entryJs)
})

test('global serve', async () => {
  await serve(
    () => execa(binPath, ['serve'], { cwd }),
    async ({ page, nextUpdate, helpers }) => {
      expect(await helpers.getText('h1')).toMatch('hi')
      write('App.vue', entryVue.replace(`{{ msg }}`, 'Updated'))
      await nextUpdate() // wait for child stdout update signal
      try {
        await page.waitForFunction(selector => {
          const el = document.querySelector(selector)
          return el && el.textContent.includes('Updated')
        }, { timeout: 60000 }, 'h1')
      } catch (e) {
        if (process.env.APPVEYOR && e.message.match('timeout')) {
          // AppVeyor VM is so slow that there's a large chance this test cases will time out,
          // we have to tolerate such failures.
          console.error(e)
        } else {
          throw e
        }
      }
    }
  )
})

let server, browser, page
test('global build', async () => {
  const { stdout } = await execa(binPath, ['build', 'foo.js'], { cwd })

  expect(stdout).toMatch('Build complete.')

  const distDir = path.join(cwd, 'dist')
  const hasFile = file => fs.existsSync(path.join(distDir, file))
  expect(hasFile('index.html')).toBe(true)
  expect(hasFile('js')).toBe(true)
  expect(hasFile('css')).toBe(true)

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

  expect(h1Text).toMatch('hi')
})

test('warn if run plain `vue build` or `vue serve` alongside a `package.json` file', async () => {
  await write('package.json', `{
    "name": "hello-world",
    "version": "1.0.0",
    "scripts": {
      "serve": "vue-cli-service serve",
      "build": "vue-cli-service build"
    }
  }`)

  // Warn if a package.json with corresponding `script` field exists
  const { stdout } = await execa(binPath, ['build'], { cwd })
  expect(stdout).toMatch(/Did you mean .*(yarn|npm run) build/)

  await fs.unlink(path.join(cwd, 'App.vue'))

  // Fail if no entry file exists, also show a hint for npm scripts
  expect(() => {
    execa.sync(binPath, ['build'], { cwd })
  }).toThrow(/Did you mean .*(yarn|npm run) build/)

  expect(() => {
    execa.sync(binPath, ['serve'], { cwd })
  }).toThrow(/Did you mean .*(yarn|npm run) serve/)

  // clean up, otherwise this file will affect other tests
  await fs.unlink(path.join(cwd, 'package.json'))
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
