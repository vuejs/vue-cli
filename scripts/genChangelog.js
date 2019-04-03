const fs = require('fs')
const path = require('path')
const execa = require('execa')

async function genNewRelease () {
  const { stdout } = await execa(require.resolve('lerna-changelog/bin/cli'), ['--from', 'v3.5.0'])
  return stdout
}

const gen = (module.exports = async () => {
  const newRelease = await genNewRelease()
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md')

  const newChangelog = newRelease + '\n\n\n' + fs.readFileSync(changelogPath, { encoding: 'utf8' })
  fs.writeFileSync(changelogPath, newChangelog)

  delete process.env.PREFIX
})

if (require.main === module) {
  gen().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
