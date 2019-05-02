const fs = require('fs')
const path = require('path')

const execa = require('execa')
const semver = require('semver')

// TODO:
// in v4 we don't need version marker's package.json to store all the versions
// so this logic can be removed
async function markVersions () {
  const packages = JSON.parse(
    (await execa(require.resolve('lerna/cli'), ['list', '--json'])).stdout
  ).filter(p => !p.private)
  const markerPath = path.resolve(__dirname, '../packages/vue-cli-version-marker/package.json')
  const marker = JSON.parse(fs.readFileSync(markerPath))

  const curVersion = marker.version
  const mainVersion = require('../lerna.json').version

  if (semver.prerelease(mainVersion)) {
    marker.version = mainVersion
  } else {
    const releaseType = semver.diff(curVersion, mainVersion) || 'patch'
    marker.version = semver.inc(marker.version, releaseType)
  }

  marker.devDependencies = packages.reduce((prev, pkg) => {
    prev[pkg.name] = pkg.version
    return prev
  }, {})
  fs.writeFileSync(markerPath, JSON.stringify(marker, null, 2))
}

markVersions().catch(err => {
  console.error(err)
  process.exit(1)
})
