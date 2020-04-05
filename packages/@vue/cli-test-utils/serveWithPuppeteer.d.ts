import execa = require('execa')
import { Browser, Page } from 'puppeteer'

interface Helpers {
  getText: (selector: string) => Promise<string>
  hasElement: (selector: string) => Promise<boolean>
  hasClass: (selector: string, cls: string) => Promise<boolean>
}

interface Utils {
  url: string
  browser: Browser
  page: Page
  /** wait for hot replacement */
  nextUpdate: () => Promise<string>
  helpers: Helpers
  requestUrls: string[]
}

declare function serveWithPuppeteer(
  serve: () => execa.ExecaChildProcess,
  /** Function which executes test codes*/
  test: (arg: Utils) => any,
  /**
   * don't launch puppeteer.
   * Defaults to `false`.
   */
  noPuppeteer?: boolean,
): Promise<void>

export = serveWithPuppeteer
