jest.setTimeout(process.env.APPVEYOR ? 120000 : 60000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('e2e-cypress', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-e2e-cypress': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })

  const config = JSON.parse(await project.read('cypress.json'))
  config.video = false
  await project.write('cypress.json', JSON.stringify(config))

  if (!process.env.CI) {
    await project.run(`vue-cli-service test:e2e`)
  } else if (!process.env.APPVEYOR) {
    await project.run(`vue-cli-service test:e2e --headless`)
  }
})

test('should work with TS', async () => {
  const project = await create('e2e-cypress-ts', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        'classComponent': true,
        'tsLint': true,
        'lintOn': ['save']
      },
      '@vue/cli-plugin-e2e-cypress': {}
    }
  })

  const config = JSON.parse(await project.read('cypress.json'))
  config.video = false
  await project.write('cypress.json', JSON.stringify(config))

  if (!process.env.CI) {
    await project.run(`vue-cli-service test:e2e`)
  } else if (!process.env.APPVEYOR) {
    await project.run(`vue-cli-service test:e2e --headless`)
  }
})
