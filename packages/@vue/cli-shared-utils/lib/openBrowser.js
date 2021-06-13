/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/facebook/create-react-app/blob/master/LICENSE
 */

const open = require('open')
const execa = require('execa')
const chalk = require('chalk')
const execSync = require('child_process').execSync

// https://github.com/sindresorhus/open#app
const OSX_CHROME = 'google chrome'

const Actions = Object.freeze({
  NONE: 0,
  BROWSER: 1,
  SCRIPT: 2
})

function getBrowserEnv () {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/open#app for documentation.
  const value = process.env.BROWSER
  let action
  if (!value) {
    // Default.
    action = Actions.BROWSER
  } else if (value.toLowerCase().endsWith('.js')) {
    action = Actions.SCRIPT
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE
  } else {
    action = Actions.BROWSER
  }
  return { action, value }
}

function executeNodeScript (scriptPath, url) {
  const extraArgs = process.argv.slice(2)
  const child = execa('node', [scriptPath, ...extraArgs, url], {
    stdio: 'inherit'
  })
  child.on('close', code => {
    if (code !== 0) {
      console.log()
      console.log(
        chalk.red(
          'The script specified as BROWSER environment variable failed.'
        )
      )
      console.log(chalk.cyan(scriptPath) + ' exited with code ' + code + '.')
      console.log()
    }
  })
  return true
}

function startBrowserProcess (browser, url) {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromeWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === OSX_CHROME)

  if (shouldTryOpenChromeWithAppleScript) {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"')
      execSync('osascript openChrome.applescript "' + encodeURI(url) + '"', {
        cwd: __dirname,
        stdio: 'ignore'
      })
      return true
    } catch (err) {
      // Ignore errors.
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing the string `open` to `open` function (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
  // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined
  }

  // Fallback to open
  // (It will always open new tab)
  try {
    const options = { app: { name: browser }, url: true }
    open(url, options).catch(() => {}) // Prevent `unhandledRejection` error.
    return true
  } catch (err) {
    return false
  }
}

/**
 * Reads the BROWSER environment variable and decides what to do with it. Returns
 * true if it opened a browser or ran a node.js script, otherwise false.
 */
exports.openBrowser = function (url) {
  const { action, value } = getBrowserEnv()
  switch (action) {
  case Actions.NONE:
    // Special case: BROWSER="none" will prevent opening completely.
    return false
  case Actions.SCRIPT:
    return executeNodeScript(value, url)
  case Actions.BROWSER:
    return startBrowserProcess(value, url)
  default:
    throw new Error('Not implemented.')
  }
}
