const fs = require('fs')
const path = require('path')
const execa = require('execa')

async function genNewRelease () {
  if (process.env.GIT_E2E_SETUP) {
    return 'skipped for e2e testing'
  }

  const nextVersion = require('../lerna.json').version
  const { stdout } = await execa(require.resolve('lerna-changelog/bin/cli'), [
    '--next-version',
    nextVersion
  ])
  return stdout
}

const gen = (module.exports = async () => {
  const newRelease = await genNewRelease()
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md')

  const newChangelog =
    newRelease + '\n\n\n' + fs.readFileSync(changelogPath, { encoding: 'utf8' })
  fs.writeFileSync(changelogPath, newChangelog)

  delete process.env.PREFIX
})

if (require.main === module) {
  gen().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
