const fs = require('fs')
const path = require('path')
const cc = require('conventional-changelog')
const config = require('@vue/conventional-changelog')

function genNewRelease (version) {
  return new Promise(resolve => {
    const newReleaseStream = cc({
      config,
      releaseCount: 2,
      pkg: {
        transform (pkg) {
          pkg.version = `v${version}`
          return pkg
        }
      }
    })

    let output = ''
    newReleaseStream.on('data', buf => {
      output += buf
    })
    newReleaseStream.on('end', () => resolve(output))
  })
}

const gen = (module.exports = async version => {
  const newRelease = await genNewRelease(version)
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md')

  const newChangelog = newRelease + fs.readFileSync(changelogPath, { encoding: 'utf8' })
  fs.writeFileSync(changelogPath, newChangelog)

  delete process.env.PREFIX
})

if (require.main === module) {
  const version = require('../lerna.json').version

  gen(version).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
