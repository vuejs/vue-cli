jest.setTimeout(40000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('e2e-nightwatch', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-e2e-nightwatch': {}
    }
  })
  await project.run(`vue-cli-service test:e2e`)
})
