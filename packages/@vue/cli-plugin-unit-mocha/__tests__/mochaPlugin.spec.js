jest.setTimeout(3000000)

const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

test('should work', async () => {
  const project = await createOutside('unit-mocha', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})
