jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-mocha-webpack', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha-webpack': {
        assertionLibrary: 'chai'
      }
    }
  })
  await project.run(`vue-cli-service test`)
})
