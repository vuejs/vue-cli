const puppeteer = require('puppeteer')

const puppeteerOptions = process.env.CI
  ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : {}

module.exports = async function launchPuppeteer (url) {
  const browser = await puppeteer.launch(puppeteerOptions)
  const page = await browser.newPage()

  const logs = []
  page.on('console', msg => logs.push(msg.text()))

  await page.goto(url)

  return { browser, page, logs }
}
