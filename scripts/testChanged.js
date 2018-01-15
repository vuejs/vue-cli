const execa = require('execa')
const chalk = require('chalk')

const additionalArgs = process.argv.slice(2)

;(async () => {
  // get modified files
  const { stdout } = await execa('git', ['ls-files', '--exclude-standard', '--modified', '--others'])
  const files = stdout.split('\n')
    .filter(line => /\.js$/.test(line))
    .filter(line => /^(packages|__mocks__)/.test(line))

  if (!files.length) {
    console.log(
      `No modified & unstaged src files found.\n` +
      `To run the full test suite, run ${chalk.cyan(`yarn test-all`)} instead.`
    )
    return
  }

  await execa('jest', [
    '--env', 'node',
    '--runInBand',
    ...additionalArgs,
    '--findRelatedTests', ...files
  ], {
    stdio: 'inherit'
  })
})().catch(err => {
  err
  process.exit(1)
})
