jest.setTimeout(20000)

const { defaults } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

test('serve', async () => {
  const project = await create('e2e-serve', defaults)

  await serve(project, async ({ nextUpdate, assertText }) => {
    const msg = `Welcome to Your Vue.js App`
    await assertText('h1', msg)

    // test hot reload
    const file = await project.read(`src/App.vue`)
    await project.write(`src/App.vue`, file.replace(msg, `Updated`))

    await nextUpdate() // wait for child stdout update signal
    await sleep(1000) // give the client time to update, should happen in 1s
    await assertText('h1', `Updated`)
  })
})
