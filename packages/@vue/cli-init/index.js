const execa = require('execa')
const binPath = require.resolve('vue-cli/bin/vue-init')

const argv = process.argv
const initIndex = argv.indexOf('init')

if (initIndex > -1) {
  execa(
    binPath,
    argv.slice(initIndex + 1),
    { stdio: 'inherit' }
  )
}
