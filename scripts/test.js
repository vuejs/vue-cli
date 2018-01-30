const execa = require('execa')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

let regex = args._[0]
if (args.p || args.package) {
  const packages = (args.p || args.package).split(',').join('|')
  regex = `.*@vue/(${packages}|cli-plugin-(${packages}))/.*\\.spec\\.js$`
}

;(async () => {
  await execa('jest', [
    '--env', 'node',
    '--runInBand',
    ...(regex ? [regex] : [])
  ], {
    stdio: 'inherit'
  })
})().catch(err => {
  err
  process.exit(1)
})
