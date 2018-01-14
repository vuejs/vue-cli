jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('ts-unit-mocha', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test`)
})

// TODO jest
