/**

How to do a release:

1. Make sure you have publish access for all packages:
    - You must be in the CLI team in the npm @vue organization
    - You must have publish access to vue-cli-version-marker
    - Make sure you DO NOT have npm per-publish 2-factor / OTP enabled, as it
      does not work with Lerna (which we use for batch publishing).

2. Run `yarn release`, follow prompts

3A. If everything works properly, the tag should have been auto-pushed and a
    local changelog commit should have been generated. Go to 4.

3B. If the publish fails half-way, things have gotten hairy. Now you need to
    go to npm to check which packages have been published and manually publish
    the ones that have not been published yet. After all have been published:

    3B.1. Push the release git tag to GitHub.
    3B.2. Run `yarn changelog` to generate changelog commit.

4. Push the changelog commit to `dev` branch.

5. Go to GitHub and verify that the changelog is live.

6. Go to GitHub releases page and publish the release (this is required for
   the release to show up in the issue helper)

Note: eslint-config-* packages should be released separately & manually.

*/

process.env.VUE_CLI_RELEASE = true

const fs = require('fs')
const path = require('path')
const execa = require('execa')
const semver = require('semver')
const inquirer = require('inquirer')
const { syncDeps } = require('./syncDeps')
// const { buildEditorConfig } = require('./buildEditorConfig')

const curVersion = require('../lerna.json').version

const release = async () => {
  console.log(`Current version: ${curVersion}`)

  const bumps = ['patch', 'minor', 'major', 'prerelease']
  const versions = {}
  bumps.forEach(b => { versions[b] = semver.inc(curVersion, b) })
  const bumpChoices = bumps.map(b => ({ name: `${b} (${versions[b]})`, value: b }))

  const { bump, customVersion } = await inquirer.prompt([
    {
      name: 'bump',
      message: 'Select release type:',
      type: 'list',
      choices: [
        ...bumpChoices,
        { name: 'custom', value: 'custom' }
      ]
    },
    {
      name: 'customVersion',
      message: 'Input version:',
      type: 'input',
      when: answers => answers.bump === 'custom'
    }
  ])

  const version = customVersion || versions[bump]

  const { yes } = await inquirer.prompt([{
    name: 'yes',
    message: `Confirm releasing ${version}?`,
    type: 'confirm'
  }])

  if (yes) {
    await syncDeps({
      version,
      local: true,
      skipPrompt: true
    })
    delete process.env.PREFIX

    // buildEditorConfig()

    await execa('git', ['add', '-A'], { stdio: 'inherit' })
    await execa('git', ['commit', '-m', 'chore: pre release sync'], { stdio: 'inherit' })
  }

  const lernaArgs = [
    'publish',
    version
  ]
  const releaseType = semver.diff(curVersion, version)

  // keep packages' minor version in sync
  if (releaseType !== 'patch') {
    lernaArgs.push('--force-publish')
  }
  await execa(require.resolve('lerna/cli'), lernaArgs, { stdio: 'inherit' })

  await require('./genChangelog')(version)

  const packages = JSON.parse(
    (await execa(require.resolve('lerna/cli'), ['list', '--json'])).stdout
  ).filter(p => !p.private)
  const versionMarkerPath = path.resolve(__dirname, '../packages/vue-cli-version-marker/package.json')
  const versionMarkerPkg = JSON.parse(fs.readFileSync(versionMarkerPath))

  versionMarkerPkg.version = semver.inc(versionMarkerPkg.version, releaseType)
  versionMarkerPkg.devDependencies = packages.reduce((prev, pkg) => {
    prev[pkg.name] = pkg.version
    return prev
  }, {})
  fs.writeFileSync(versionMarkerPath, JSON.stringify(versionMarkerPkg, null, 2))

  const tagName = `vue-cli-version-marker@${versionMarkerPkg.version}`
  await execa('git', ['add', '-A'], { stdio: 'inherit' })
  await execa('git', ['commit', '-m', `chore: ${tagName}`], { stdio: 'inherit' })

  // Must specify registry url: https://github.com/lerna/lerna/issues/896#issuecomment-311894609
  await execa(
    'npm',
    ['publish', '--registry', 'https://registry.npmjs.org/'],
    { stdio: 'inherit', cwd: path.dirname(versionMarkerPath) }
  )

  await execa('git', ['tag', tagName], { stdio: 'inherit' })
  await execa('git', ['push', '--tags'], { stdio: 'inherit' })
}

release().catch(err => {
  console.error(err)
  process.exit(1)
})
