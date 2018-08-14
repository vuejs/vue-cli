const execa = require('execa')
const cc = require('conventional-changelog')
const config = require('@vue/conventional-changelog')

const gen = module.exports = version => {
  const fileStream = require('fs').createWriteStream(`CHANGELOG.md`)

  cc({
    config,
    releaseCount: 0,
    pkg: {
      transform (pkg) {
        pkg.version = `v${version}`
        return pkg
      }
    }
  }).pipe(fileStream).on('close', async () => {
    delete process.env.PREFIX
    await execa('git', ['add', '-A'], { stdio: 'inherit' })
    await execa('git', ['commit', '-m', `chore: ${version} changelog [ci skip]`], { stdio: 'inherit' })
  })
}

if (process.argv[2] === 'run') {
  const version = require('../lerna.json').version
  gen(version)
}
