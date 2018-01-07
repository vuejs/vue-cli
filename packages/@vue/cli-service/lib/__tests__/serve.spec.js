jest.setTimeout(30000)

const { defaults } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

test('serve', async () => {
  const project = await create('e2e-serve', defaults)

  await serve(project, async ({ nextUpdate, getText }) => {
    const msg = `Welcome to Your Vue.js App`
    expect(await getText('h1')).toMatch(msg)

    // test hot reload
    const file = await project.read(`src/App.vue`)
    project.write(`src/App.vue`, file.replace(msg, `Updated`))
    await nextUpdate() // wait for child stdout update signal
    await sleep(1000) // give the client time to update
    expect(await getText('h1')).toMatch(`Updated`)
  })
})
