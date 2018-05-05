jest.setTimeout(45000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

test('serve', async () => {
  const project = await create('e2e-serve', defaultPreset)

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
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

test('serve with router', async () => {
  const project = await create('e2e-serve-router', Object.assign({}, defaultPreset, {
    router: true
  }))

  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ page, helpers }) => {
      expect(await helpers.getText('h1')).toMatch(`Welcome to Your Vue.js App`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="#/"]', 'router-link-exact-active')).toBe(true)
      expect(await helpers.hasClass('a[href="#/about"]', 'router-link-exact-active')).toBe(false)

      await page.click('a[href="#/about"]')
      expect(await helpers.getText('h1')).toMatch(`This is an about page`)
      expect(await helpers.hasElement('#nav')).toBe(true)
      expect(await helpers.hasClass('a[href="#/"]', 'router-link-exact-active')).toBe(false)
      expect(await helpers.hasClass('a[href="#/about"]', 'router-link-exact-active')).toBe(true)
    }
  )
})

test('serve with inline entry', async () => {
  const project = await create('e2e-serve-inline-entry', defaultPreset)

  const path = require('path')
  const fs = require('fs-extra')
  await fs.move(
    path.resolve(project.dir, 'src/main.js'),
    path.resolve(project.dir, 'src/index.js')
  )

  await serve(
    () => project.run('vue-cli-service serve src/index.js'),
    async ({ nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
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
