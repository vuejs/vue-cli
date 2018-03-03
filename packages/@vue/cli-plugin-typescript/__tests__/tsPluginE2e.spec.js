jest.setTimeout(40000)

const create = require('@vue/cli-test-utils/createTestProject')

test('cypress', async () => {
  const project = await create('ts-e2e-cypress', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })
  await project.run(`vue-cli-service e2e`)
})

test('cypress with router', async () => {
  const project = await create('ts-e2e-cypress-router', {
    router: true,
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })
  await project.run(`vue-cli-service e2e`)
})

test('nightwatch', async () => {
  const project = await create('ts-e2e-nightwatch', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })
  await project.run(`vue-cli-service e2e`)
})
