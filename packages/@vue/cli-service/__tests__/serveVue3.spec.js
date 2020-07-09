const { defaultPreset } = require('@vue/cli/lib/options')
// needs to be outside the workspace, so we reuse the createUpgradableProject functionality here
const create = require('@vue/cli-test-utils/createUpgradableProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

jest.setTimeout(300000)

test('serve with Vue 3', async () => {
  const project = await create('e2e-serve-vue-3', Object.assign({}, defaultPreset, { vueVersion: '3' }))

  await serve(
    () => project.run('yarn serve'),
    async ({ page, nextUpdate, helpers }) => {
      const msg = `Welcome to Your Vue.js App`
      expect(await helpers.getText('h1')).toMatch(msg)

      // test hot reload
      const file = await project.read(`src/App.vue`)
      project.write(`src/App.vue`, file.replace(msg, `Updated`))
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
