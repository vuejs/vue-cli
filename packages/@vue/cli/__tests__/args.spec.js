const path = require('path')
const execa = require('execa')

const CLI_PATH = path.resolve(__dirname, '..', 'bin', 'vue.js')

const runAsync = async args => await execa(CLI_PATH, args)

test('suggests matching command', async () => {
  const { stdout } = await runAsync(['confgi'])
  expect(stdout).toContain('Did you mean config?')
})
