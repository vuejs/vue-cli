jest.setTimeout(3000000)

const path = require('path')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createUpgradableProject')
const portfinder = require('portfinder')
const createServer = require('@vue/cli-test-utils/createServer')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page

const webpack4Preset = {
  ...defaultPreset,
  plugins: {
    ...defaultPreset.plugins,
    '@vue/cli-plugin-webpack-4': {}
  }
}

test('build', async () => {
  // TODO:
  // Find a way to test which webpack version the project is built with
  // For now it's not necessary as the mocha tests have covered it (mochapack doesn't work with webpack 5)

  const project = await create('e2e-build-webpack-4', webpack4Preset)
  // test public copy
  project.write('public/foo.js', '1')
  // make sure that only /public/index.html is skipped (#3119)
  project.write('public/subfolder/index.html', '1')

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/favicon.ico')).toBe(true)
  expect(project.has('dist/js')).toBe(true)
  expect(project.has('dist/css')).toBe(true)
  expect(project.has('dist/foo.js')).toBe(true)
  expect(project.has('dist/subfolder/index.html')).toBe(true)

  const index = await project.read('dist/index.html')

  // should have set the title inferred from the project name
  expect(index).toMatch(/<title>e2e-build<\/title>/)

  // should inject scripts
  expect(index).toMatch(/<script src="\/js\/chunk-vendors\.\w{8}\.js">/)
  expect(index).toMatch(/<script src="\/js\/app\.\w{8}\.js">/)
  // should inject css
  expect(index).toMatch(/<link href="\/css\/app\.\w{8}\.css" rel="stylesheet">/)

  // should reference favicon with correct base URL
  expect(index).toMatch(/<link rel="icon" href="\/favicon.ico">/)

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

test('multi-page', async () => {
  const project = await create('e2e-build-webpack-4-multipage', webpack4Preset)

  await project.write('vue.config.js', `
module.exports = {
  pages: {
    foo: 'src/main.js',
    bar: 'src/main.js',
  }
}
  `)

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/foo.html')).toBe(true)
  expect(project.has('dist/bar.html')).toBe(true)
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
