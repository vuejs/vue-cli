jest.setTimeout(300000)
const create = require('@vue/cli-test-utils/createUpgradableProject')
test('mocha', async () => {
  const project = await create('ts-unit-mocha', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})
