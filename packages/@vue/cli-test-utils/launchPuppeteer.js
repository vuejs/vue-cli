const puppeteer = require('puppeteer')

const puppeteerOptions = process.env.CI
  ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : {}

module.exports = async function launchPuppeteer (url) {
  const browser = await puppeteer.launch(puppeteerOptions)
  const page = await browser.newPage()
  await page.goto(url)

  return { browser, page }
}
