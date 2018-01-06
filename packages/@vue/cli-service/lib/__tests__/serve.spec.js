jest.setTimeout(20000)

const puppeteer = require('puppeteer')
const { defaults } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProjectWithOptions')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

let activeBrowser
let activeChild

test('serve', async () => {
  const { read, write, run } = await create('e2e', defaults)

  let notifyUpdate
  const nextUpdate = () => {
    return new Promise(resolve => {
      notifyUpdate = resolve
    })
  }

  const runTest = async (url) => {
    const browser = activeBrowser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)

    const assertText = async (selector, text) => {
      const value = await page.evaluate(() => {
        return document.querySelector('h1').textContent
      })
      expect(value).toMatch(text)
    }

    const msg = `Welcome to Your Vue.js App`
    await assertText('h1', msg)

    // test hot reload
    const file = await read(`src/App.vue`)
    await write(`src/App.vue`, file.replace(msg, `Updated`))

    await nextUpdate() // wait for child stdout update signal
    await sleep(1000) // give the client time to update, should happen in 1s
    await assertText('h1', `Updated`)

    await browser.close()
    activeBrowser = null
  }

  await new Promise(resolve => {
    const child = activeChild = run(`vue-cli-service serve`)

    let isFirstMatch = true
    child.stdout.on('data', async (data) => {
      const urlMatch = data.toString().match(/http:\/\/[^/]+\//)
      if (urlMatch && isFirstMatch) {
        isFirstMatch = false
        await runTest(urlMatch[0])
        child.kill()
        resolve()
      } else if (data.toString().match(/App updated/)) {
        if (notifyUpdate) {
          notifyUpdate()
        }
      }
    })

    child.on('exit', () => {
      activeChild = null
    })
  })
})

// cleanup in case test failed
afterAll(async () => {
  if (activeBrowser) {
    await activeBrowser.close()
  }
  if (activeChild) {
    activeChild.kill()
  }
})
