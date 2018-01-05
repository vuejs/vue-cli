jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProjectWithOptions')

test('should work', async () => {
  const { run } = await create('unit-mocha-webpack', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha-webpack': {
        assertionLibrary: 'chai'
      }
    }
  })
  await run(`vue-cli-service test`)
})
