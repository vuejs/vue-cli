const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const semver = require('semver')

let _hasYarn
const _yarnProjects = new LRU({
  max: 10,
  maxAge: 1000
})
let _hasGit
const _gitProjects = new LRU({
  max: 10,
  maxAge: 1000
})

// env detection
exports.hasYarn = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasYarn != null) {
    return _hasYarn
  }
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

exports.hasProjectYarn = (cwd) => {
  if (_yarnProjects.has(cwd)) {
    return checkYarn(_yarnProjects.get(cwd))
  }

  const lockFile = path.join(cwd, 'yarn.lock')
  const result = fs.existsSync(lockFile)
  _yarnProjects.set(cwd, result)
  return checkYarn(result)
}

function checkYarn (result) {
  if (result && !exports.hasYarn()) throw new Error(`The project seems to require yarn but it's not installed.`)
  return result
}

exports.hasGit = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasGit != null) {
    return _hasGit
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}

let _hasPnpm
let _hasPnpm3orLater
const _pnpmProjects = new LRU({
  max: 10,
  maxAge: 1000
})

exports.hasPnpm3OrLater = () => {
  if (process.env.VUE_CLI_TEST) {
    return true
  }
  if (_hasPnpm3orLater != null) {
    return _hasPnpm3orLater
  }
  try {
    const pnpmVersion = execSync('pnpm --version', {
      stdio: ['pipe', 'pipe', 'ignore']
    }).toString()
    // there's a critical bug in pnpm 2
    // https://github.com/pnpm/pnpm/issues/1678#issuecomment-469981972
    // so we only support pnpm >= 3.0.0
    _hasPnpm = true
    _hasPnpm3orLater = semver.gte(pnpmVersion, '3.0.0')
    return _hasPnpm3orLater
  } catch (e) {
    return (_hasPnpm3orLater = false)
  }
}

exports.hasProjectPnpm = (cwd) => {
  if (_pnpmProjects.has(cwd)) {
    return checkPnpm(_pnpmProjects.get(cwd))
  }

  const lockFile = path.join(cwd, 'pnpm-lock.yaml')
  const result = fs.existsSync(lockFile)
  _pnpmProjects.set(cwd, result)
  return checkPnpm(result)
}

function checkPnpm (result) {
  if (result && !exports.hasPnpm3OrLater()) {
    throw new Error(`The project seems to require pnpm${_hasPnpm ? ' >= 3' : ''} but it's not installed.`)
  }
  return result
}

// OS
exports.isWindows = process.platform === 'win32'
exports.isMacintosh = process.platform === 'darwin'
exports.isLinux = process.platform === 'linux'

const browsers = {}
let hasCheckedBrowsers = false

function run (cmd) {
  return (
    execSync(cmd, {
      stdio: [0, 'pipe', 'ignore']
    }).toString() || ''
  ).trim()
}

function getLinuxAppVersion (binary) {
  try {
    return run(`${binary} --version`).replace(/^.* ([^ ]*)/g, '$1')
  } catch (e) {}
}

function getMacAppVersion (bundleIdentifier) {
  try {
    const bundlePath = run(`mdfind "kMDItemCFBundleIdentifier=='${bundleIdentifier}'"`)

    return run(`/usr/libexec/PlistBuddy -c Print:CFBundleShortVersionString ${
      bundlePath.replace(/(\s)/g, '\\ ')
    }/Contents/Info.plist`)
  } catch (e) {}
}

Object.defineProperty(exports, 'installedBrowsers', {
  enumerable: true,
  get () {
    if (hasCheckedBrowsers) {
      return browsers
    }
    hasCheckedBrowsers = true

    if (exports.isWindows) {
      browsers.chrome = getLinuxAppVersion('google-chrome')
      browsers.firefox = getLinuxAppVersion('firefox')
    } else if (exports.isMacintosh) {
      browsers.chrome = getMacAppVersion('com.google.Chrome')
      browsers.firefox = getMacAppVersion('org.mozilla.firefox')
    } else if (exports.isWindows) {
      // TODO:
      // get chrome stable version: https://stackoverflow.com/a/51773107/2302258
      // get firefox version: https://community.spiceworks.com/topic/111518-how-to-determine-version-of-installed-firefox-in-windows-batchscript
    }

    return browsers
  }
})
