const execa = require('execa')

const additionalArgs = process.argv.slice(2)

;(async () => {
  // get modified files
  const { stdout } = await execa('git', ['ls-files', '--exclude-standard', '--modified', '--others'])
  const files = stdout.split('\n').filter(line => /\.js$/.test(line))

  await execa('jest', [
    '--env', 'node',
    '--runInBand',
    ...additionalArgs,
    '--findRelatedTests', ...files
  ], {
    stdio: 'inherit'
  })
})().catch(err => {
  console.error(err)
  process.exit(1)
})
