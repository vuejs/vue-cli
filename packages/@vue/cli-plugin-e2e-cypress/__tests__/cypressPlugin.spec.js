jest.setTimeout(30000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('e2e-cypress', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })

  const config = JSON.parse(await project.read('cypress.json'))
  config.videoRecording = false
  await project.write('cypress.json', JSON.stringify(config))

  await project.run(`vue-cli-service e2e`)
})
