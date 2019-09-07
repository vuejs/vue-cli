// Appveyor current only ships Chrome 72
// which is no longer supported by the latest version of Chromedriver.

const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

const versionString = require('child_process').execSync('wmic datafile where name="C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" get Version /value').toString()
const majorVersion = versionString.match(/Version=(\d+)/)[1]
pkg.resolutions.chromedriver = `^${majorVersion}.0.0`

console.log(`patched chromedriver to version ${majorVersion}`)

fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, null, 2))
