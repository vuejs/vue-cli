const execa = require('execa')

const plugins = process.argv.slice(2)
const regex = new RegExp(`.*cli-plugin-(${plugins.join('|')})/.*\\.spec\\.js$`)

;(async () => {
  await execa('jest', [
    '--env', 'node',
    '--runInBand',
    regex.toString().slice(1, -1)
  ], {
    stdio: 'inherit'
  })
})().catch(err => {
  console.error(err)
  process.exit(1)
})
