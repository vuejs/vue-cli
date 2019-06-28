const fs = require('fs')
const path = require('path')
const create = require('@vue/cli-test-utils/createTestProject')

jest.setTimeout(200000)

const outsideTestFolder = path.resolve(__dirname, '../../../../../tests')

beforeAll(() => {
  if (!fs.existsSync(outsideTestFolder)) {
    fs.mkdirSync(outsideTestFolder)
  }
})

test('upgrade: plugin-babel v3.5', async () => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
  const project = await create('plugin-babel-old', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.5.3'
      }
    }
  }, outsideTestFolder)

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies).not.toHaveProperty('core-js')

  // await project.run(`${require.resolve('../bin/vue')} upgrade @vue/cli-plugin-babel`)

  // const updatedPkg = JSON.parse(await project.read('package.json'))
  // expect(updatedPkg.dependencies).toHaveProperty('core-js')
})
