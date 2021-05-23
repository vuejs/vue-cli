jest.setTimeout(process.env.APPVEYOR ? 120000 : 60000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('e2e-webdriverio', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-e2e-webdriverio': {
        webdrivers: ['chrome']
      },
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })

  if (!process.env.CI) {
    await project.run(`vue-cli-service test:e2e`)
  } else if (!process.env.APPVEYOR) {
    await project.run(`vue-cli-service test:e2e --headless`)
  }
})

test('should work with TS', async () => {
  const project = await create('e2e-webdriverio-ts', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        'classComponent': true,
        'lintOn': ['save']
      },
      '@vue/cli-plugin-e2e-webdriverio': {
        webdrivers: ['chrome']
      }
    }
  })

  if (!process.env.CI) {
    await project.run(`vue-cli-service test:e2e`)
  } else if (!process.env.APPVEYOR) {
    await project.run(`vue-cli-service test:e2e --headless`)
  }
})
