jest.setTimeout(120 * 1000)

const create = require('@vue/cli-test-utils/createTestProject')

beforeAll(() => {
  // Playwright internally protects users from running @playwright/test tests with the
  // Playwright Test test-runner. This hack allows us to still test it via Jest.
  delete process.env.JEST_WORKER_ID
})

test('should work', async () => {
  const project = await create('e2e-playwright', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-e2e-playwright': {},
      '@vue/cli-plugin-eslint': {
        config: 'airbnb',
        lintOn: 'save'
      }
    }
  })

  expect(project.has('playwright.config.js')).toBe(true)
  await project.run(`playwright test`)
})

test('should work with TS', async () => {
  const project = await create('e2e-playwright-ts', {
    plugins: {
      '@vue/cli-plugin-typescript': {
        'classComponent': true,
        'lintOn': ['save']
      },
      '@vue/cli-plugin-e2e-playwright': {}
    }
  })

  expect(project.has('playwright.config.ts')).toBe(true)
  await project.run(`playwright test`)
})
