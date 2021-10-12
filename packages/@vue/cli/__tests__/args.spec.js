const path = require('path')
const { execa } = require('@vue/cli-shared-utils')

const CLI_PATH = path.resolve(__dirname, '..', 'bin', 'vue.js')

const runAsync = (args, options) => execa(CLI_PATH, args, options)

test('suggests matching command', async () => {
  const { code, stdout } = await runAsync(['confgi'], { reject: false })

  // Assertions
  expect(code).toBe(1)
  expect(stdout).toContain('Did you mean config?')
})
