jest.setTimeout(process.env.APPVEYOR ? 850000 : 50000)

const create = require('@vue/cli-test-utils/createTestProject')

// temporarily disabled on AppVeyor
// due to Cypress upstream issue
// https://github.com/cypress-io/cypress/issues/1841
if (!process.env.APPVEYOR) {
  test('cypress', async () => {
    const project = await create('ts-e2e-cypress-router', {
      plugins: {
        '@vue/cli-plugin-router': {},
        '@vue/cli-plugin-typescript': {},
        '@vue/cli-plugin-e2e-cypress': {}
      }
    })
    const config = JSON.parse(await project.read('cypress.json'))
    config.video = false
    await project.write('cypress.json', JSON.stringify(config))
    await project.run(`vue-cli-service test:e2e --headless`)
  })
}

if (!process.env.CIRCLECI) {
  test('nightwatch', async () => {
    const project = await create('ts-e2e-nightwatch', {
      plugins: {
        '@vue/cli-plugin-typescript': {},
        '@vue/cli-plugin-e2e-nightwatch': {}
      }
    })
    await project.run(`vue-cli-service test:e2e`)
  })
}
