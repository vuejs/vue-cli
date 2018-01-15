jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-jest', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test`)
})
