jest.setTimeout(30000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createUpgradableProject')

const webpack4Preset = {
  ...defaultPreset,
  plugins: {
    ...defaultPreset.plugins,
    '@vue/cli-plugin-webpack-4': {}
  }
}

test('build with customizations', async () => {
  const project = await create('e2e-custom-webpack-4', webpack4Preset)

  // TODO: customizations

  const { stdout } = await project.run('vue-cli-service build')
  expect(stdout).toMatch('Build complete.')
})
