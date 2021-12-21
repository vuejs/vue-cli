const minimist = require('minimist')
const rawArgs = process.argv.slice(2)
const args = minimist(rawArgs)

let regex
if (args.p) {
  const packages = (args.p || args.package).split(',').join('|')
  regex = `.*@vue/(${packages}|cli-plugin-(${packages}))/.*\\.spec\\.js$`
  const i = rawArgs.indexOf('-p')
  rawArgs.splice(i, 2)
}

const e2ePathPattern = 'Migrator|Vue3|mochaPlugin|MochaPlugin|eslint8'

if (args['e2e-only']) {
  regex = e2ePathPattern
  const i = rawArgs.indexOf('--e2e-only')
  rawArgs.splice(i, 2)
}

const jestArgs = [
  '--env', 'node',
  '--runInBand',
  ...rawArgs,
  ...(regex ? [regex] : [])
]

if (!args['e2e-only']) {
  jestArgs.push('--testPathIgnorePatterns', e2ePathPattern)
}

console.log(`running jest with args: ${jestArgs.join(' ')}`)

require('jest').run(jestArgs)
