jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProjectWithOptions')

it('should work', async () => {
  const { exec } = await create('unit-mocha-webpack', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha-webpack': {
        assertionLibrary: 'chai'
      }
    }
  })
  await exec(`./node_modules/.bin/vue-cli-service test`)
})
