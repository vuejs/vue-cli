jest.setTimeout(process.env.APPVEYOR ? 800000 : 30000)

const create = require('@vue/cli-test-utils/createTestProject')

test('cypress', async () => {
  const project = await create('ts-e2e-cypress-router', {
    router: true,
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })
  await project.run(`vue-cli-service test:e2e --headless`)
})

test('nightwatch', async () => {
  const project = await create('ts-e2e-nightwatch', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-nightwatch': {}
    }
  })
  await project.run(`vue-cli-service test:e2e`)
})
