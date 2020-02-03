const puppeteer = require('puppeteer')

const puppeteerOptions = process.env.CI
  ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : {}

module.exports = async function launchPuppeteer (url) {
  const browser = await puppeteer.launch(puppeteerOptions)
  const page = await browser.newPage()

  const logs = []
  const requestUrls = []
  page.on('console', msg => logs.push(msg.text()))

  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    requestUrls.push(interceptedRequest.url())
    interceptedRequest.continue()
  })

  await page.goto(url)

  return { browser, page, logs, requestUrls }
}
