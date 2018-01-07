const launchPuppeteer = require('./launchPuppeteer')

module.exports = async function serveWithPuppeteer (
  project, // should be project created with createTestProject()
  testFn // must be async
) {
  let activeBrowser
  let activeChild

  let notifyUpdate
  const nextUpdate = () => {
    return new Promise(resolve => {
      notifyUpdate = resolve
    })
  }

  await new Promise((resolve, reject) => {
    const child = activeChild = project.run('vue-cli-service serve')

    let isFirstMatch = true
    child.stdout.on('data', async (data) => {
      data = data.toString()
      try {
        const urlMatch = data.match(/http:\/\/[^/]+\//)
        if (urlMatch && isFirstMatch) {
          isFirstMatch = false
          // start browser
          const url = urlMatch[0]
          const { page, browser } = await launchPuppeteer(url)
          activeBrowser = browser

          const getText = selector => {
            return page.evaluate(selector => {
              return document.querySelector(selector).textContent
            }, selector)
          }

          await testFn({
            browser,
            page,
            url,
            nextUpdate,
            getText
          })

          await browser.close()
          activeBrowser = null
          // on appveyor, the spawned server process doesn't exit
          // and causes the build to hang.
          child.stdin.write('close')
          activeChild = null
          // kill(child.pid)
          resolve()
        } else if (data.match(/App updated/)) {
          if (notifyUpdate) {
            notifyUpdate(data)
          }
        }
      } catch (err) {
        if (activeBrowser) {
          await activeBrowser.close()
        }
        if (activeChild) {
          activeChild.stdin.write('close')
        }
        reject(err)
      }
    })

    child.on('exit', code => {
      activeChild = null
      if (code !== 0) {
        reject(`serve exited with code ${code}`)
      }
    })
  })
}
