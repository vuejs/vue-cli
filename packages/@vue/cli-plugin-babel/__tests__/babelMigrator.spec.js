const create = require('@vue/cli-test-utils/createUpgradableProject')
const { logs } = require('@vue/cli-shared-utils')

jest.setTimeout(300000)
beforeEach(() => {
  process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN = true
})

test('upgrade: plugin-babel v3.5', async () => {
  const project = await create('plugin-babel-legacy', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.5.3'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies).not.toHaveProperty('core-js')

  await project.upgrade('babel')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies).toHaveProperty('core-js')

  expect(logs.log.some(([msg]) => msg.match('core-js has been upgraded'))).toBe(true)

  // should have updated the version range in package.json
  expect(updatedPkg.devDependencies['@vue/cli-plugin-babel']).not.toMatch('3.5.3')
})

test('upgrade: plugin-babel with core-js 2', async () => {
  const project = await create('plugin-babel-v3', {
    plugins: {
      '@vue/cli-plugin-babel': {
        version: '3.8.0'
      }
    }
  })

  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.dependencies['core-js']).toMatch('^2')

  await project.upgrade('babel')

  const updatedPkg = JSON.parse(await project.read('package.json'))
  expect(updatedPkg.dependencies['core-js']).toMatch('^3')
})
