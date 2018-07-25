jest.setTimeout(40000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

let server, browser, page

afterEach(async () => {
  await browser.close()
  server.close()
})

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

test('build as lib (js)', async () => {
  const project = await create('build-lib-js', defaultPreset)
  await project.write('src/main.js', `
    export default { foo: 1 }
    export const bar = 2
  `)
  const { stdout } = await project.run('vue-cli-service build --target lib --name testLib src/main.js')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/demo.html')).toBe(true)
  expect(project.has('dist/testLib.common.js')).toBe(true)
  expect(project.has('dist/testLib.umd.js')).toBe(true)
  expect(project.has('dist/testLib.umd.min.js')).toBe(true)

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

  // should expose a module with default and named exports
  expect(await page.evaluate(() => {
    return window.testLib.default.foo
  })).toBe(1)

  expect(await page.evaluate(() => {
    return window.testLib.bar
  })).toBe(2)
})

test('build as lib with webpackConfiguration depending on target (js)', async () => {
  const project = await create('build-lib-js-webpack-target', defaultPreset)
  await project.write('src/a-library.js', `
    export default {
      foo: 'bar'
    }
  `)

  await project.write('src/main.js', `
    export * from 'a-library'
  `)

  await project.write('vue.config.js', `
    const path = require('path')
    module.exports = {
      configureWebpack: config => {
        config.resolve.alias['a-library'] = path.resolve(__dirname, 'src', 'a-library.js')

        if (config.output.libraryTarget === 'umd') {
          return
        }

        config.externals = ['a-library']
      }
    }
  `)

  const { stdout } = await project.run('vue-cli-service build --target lib --name testLib src/main.js')
  expect(stdout).toMatch('Build complete.')

  expect(project.has('dist/testLib.umd.js')).toBe(true)
  expect(project.has('dist/testLib.common.js')).toBe(true)

  const umdContent = await project.read('dist/testLib.umd.js')
  expect(umdContent).toContain(`foo: 'bar'`)

  const commonContent = await project.read('dist/testLib.common.js')
  expect(commonContent).not.toContain(`foo: 'bar'`)
})
