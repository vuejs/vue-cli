const execa = require('execa')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const packages = args._
let regex = args.g || args.grep
if (!regex && packages.length) {
  regex = `.*@vue/(${packages.join('|')}|cli-plugin-(${packages.join('|')}))/.*\\.spec\\.js$`
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
  console.error(err)
  process.exit(1)
})
