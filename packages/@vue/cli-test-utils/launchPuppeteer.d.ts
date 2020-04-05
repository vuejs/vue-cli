import { Browser, Page } from 'puppeteer'

declare function launchPuppeteer(
  url: string,
): Promise<{
  browser: Browser
  page: Page
  logs: string[]
  requestUrls: string[]
}>

export = launchPuppeteer
