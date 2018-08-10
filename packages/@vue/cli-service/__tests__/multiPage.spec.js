jest.setTimeout(80000)

const path = require('path')
const portfinder = require('portfinder')
const { createServer } = require('http-server')
const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')
const launchPuppeteer = require('@vue/cli-test-utils/launchPuppeteer')

async function makeProjectMultiPage (project) {
  await project.write('vue.config.js', `
    module.exports = {
      pages: {
        index: { entry: 'src/main.js' },
        foo: { entry: 'src/foo.js' },
        bar: { entry: 'src/bar.js' }
      },
      chainWebpack: config => {
        const splitOptions = config.optimization.get('splitChunks')
        config.optimization.splitChunks(Object.assign({}, splitOptions, {
          minSize: 100
        }))
      }
    }
  `)
  await project.write('src/foo.js', `
    import Vue from 'vue'
    new Vue({
      el: '#app',
      render: h => h('h1', 'Foo')
    })
  `)
  await project.write('src/bar.js', `
    import Vue from 'vue'
    import App from './App.vue'
    new Vue({
      el: '#app',
      render: h => h(App)
    })
  `)
  const app = await project.read('src/App.vue')
  await project.write('src/App.vue', app.replace(
    `import HelloWorld from './components/HelloWorld.vue'`,
    `const HelloWorld = () => import('./components/HelloWorld.vue')`
  ))
}

test('serve w/ multi page', async () => {
  const project = await create('e2e-multi-page-serve', defaultPreset)

  await makeProjectMultiPage(project)

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, url, helpers }) => {
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)

      await page.goto(`${url}/foo.html`)
      expect(await helpers.getText('h1')).toMatch(`Foo`)

      await page.goto(`${url}/bar.html`)
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)
    }
  )
})

let server, browser
test('build w/ multi page', async () => {
  const project = await create('e2e-multi-page-build', defaultPreset)

  await makeProjectMultiPage(project)

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')

  // should generate the HTML pages
  expect(project.has('dist/index.html')).toBe(true)
  expect(project.has('dist/foo.html')).toBe(true)
  expect(project.has('dist/bar.html')).toBe(true)

  const assertSharedAssets = file => {
    // should split and preload vendor chunk
    expect(file).toMatch(/<link [^>]*js\/chunk-vendors[^>]*\.js rel=preload as=script>/)
    // should split and preload common js and css
    expect(file).toMatch(/<link [^>]*js\/chunk-common[^>]*\.js rel=preload as=script>/)
    expect(file).toMatch(/<link [^>]*chunk-common[^>]*\.css rel=preload as=style>/)
    // should load common css
    expect(file).toMatch(/<link href=\/css\/chunk-common\.\w+\.css rel=stylesheet>/)
    // should load common js
    expect(file).toMatch(/<script [^>]*src=\/js\/chunk-vendors\.\w+\.js>/)
    expect(file).toMatch(/<script [^>]*src=\/js\/chunk-common\.\w+\.js>/)
  }

  const index = await project.read('dist/index.html')
  assertSharedAssets(index)
  // should preload correct page file
  expect(index).toMatch(/<link [^>]*js\/index[^>]*\.js rel=preload as=script>/)
  expect(index).not.toMatch(/<link [^>]*js\/foo[^>]*\.js rel=preload as=script>/)
  expect(index).not.toMatch(/<link [^>]*js\/bar[^>]*\.js rel=preload as=script>/)
  // should prefetch async chunk js and css
  expect(index).toMatch(/<link [^>]*css\/chunk-\w+\.\w+\.css rel=prefetch>/)
  expect(index).toMatch(/<link [^>]*js\/chunk-\w+\.\w+\.js rel=prefetch>/)
  // should load correct page js
  expect(index).toMatch(/<script [^>]*src=\/js\/index\.\w+\.js>/)
  expect(index).not.toMatch(/<script [^>]*src=\/js\/foo\.\w+\.js>/)
  expect(index).not.toMatch(/<script [^>]*src=\/js\/bar\.\w+\.js>/)

  const foo = await project.read('dist/foo.html')
  assertSharedAssets(foo)
  // should preload correct page file
  expect(foo).not.toMatch(/<link [^>]*js\/index[^>]*\.js rel=preload as=script>/)
  expect(foo).toMatch(/<link [^>]*js\/foo[^>]*\.js rel=preload as=script>/)
  expect(foo).not.toMatch(/<link [^>]*js\/bar[^>]*\.js rel=preload as=script>/)
  // should not prefetch async chunk js and css because it's not used by
  // this entry
  expect(foo).not.toMatch(/<link [^>]*css\/chunk-\w+\.\w+\.css rel=prefetch>/)
  expect(foo).not.toMatch(/<link [^>]*js\/chunk-\w+\.\w+\.js rel=prefetch>/)
  // should load correct page js
  expect(foo).not.toMatch(/<script [^>]*src=\/js\/index\.\w+\.js>/)
  expect(foo).toMatch(/<script [^>]*src=\/js\/foo\.\w+\.js>/)
  expect(foo).not.toMatch(/<script [^>]*src=\/js\/bar\.\w+\.js>/)

  const bar = await project.read('dist/bar.html')
  assertSharedAssets(bar)
  // should preload correct page file
  expect(bar).not.toMatch(/<link [^>]*js\/index[^>]*\.js rel=preload as=script>/)
  expect(bar).not.toMatch(/<link [^>]*js\/foo[^>]*\.js rel=preload as=script>/)
  expect(bar).toMatch(/<link [^>]*js\/bar[^>]*\.js rel=preload as=script>/)
  // should prefetch async chunk js and css
  expect(bar).toMatch(/<link [^>]*css\/chunk-\w+\.\w+\.css rel=prefetch>/)
  expect(bar).toMatch(/<link [^>]*js\/chunk-\w+\.\w+\.js rel=prefetch>/)
  // should load correct page js
  expect(bar).not.toMatch(/<script [^>]*src=\/js\/index\.\w+\.js>/)
  expect(bar).not.toMatch(/<script [^>]*src=\/js\/foo\.\w+\.js>/)
  expect(bar).toMatch(/<script [^>]*src=\/js\/bar\.\w+\.js>/)

  // assert pages work
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

  await page.goto(`${url}foo.html`)
  expect(await getH1Text()).toMatch('Foo')

  await page.goto(`${url}bar.html`)
  expect(await getH1Text()).toMatch('Welcome to Your Vue.js App')
})

afterAll(async () => {
  if (browser) {
    await browser.close()
  }
  if (server) {
    server.close()
  }
})
