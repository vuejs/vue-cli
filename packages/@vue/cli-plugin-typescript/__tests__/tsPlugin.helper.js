const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

exports.assertServe = async (name, options) => {
  test('serve', async () => {
    const project = await create(name, options)

    await serve(
      () => project.run('vue-cli-service serve'),
      async ({ nextUpdate, helpers }) => {
        const msg = `Welcome to Your Vue.js + TypeScript App`
        expect(await helpers.getText('h1')).toMatch(msg)

        // test hot reload
        const file = await project.read(`src/App.vue`)
        project.write(`src/App.vue`, file.replace(msg, `Updated`))
        await nextUpdate() // wait for child stdout update signal
        await sleep(1000) // give the client time to update
        expect(await helpers.getText('h1')).toMatch(`Updated`)
      }
    )
  })
}

exports.assertBuild = async (name, options, customAssert) => {
  let browser, server, page
  test('build', async () => {
    const project = await create(name, options)

    const { stdout } = await project.run('vue-cli-service build')
    expect(stdout).toMatch('Build complete.')

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

    expect(h1Text).toMatch('Welcome to Your Vue.js + TypeScript App')

    if (customAssert) {
      await customAssert(project, page)
    }
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
    if (server) {
      server.close()
    }
  })
}
