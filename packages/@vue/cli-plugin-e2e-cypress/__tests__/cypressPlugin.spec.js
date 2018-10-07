jest.setTimeout(process.env.APPVEYOR ? 80000 : 60000)

const create = require('@vue/cli-test-utils/createTestProject')

// temporarily disabled on AppVeyor due to upstream issue
// https://github.com/cypress-io/cypress/issues/1841
if (!process.env.APPVEYOR) {
  test('should work', async () => {
    const project = await create('e2e-cypress', {
      plugins: {
        '@vue/cli-plugin-babel': {},
        '@vue/cli-plugin-e2e-cypress': {}
      }
    })

    const pkg = JSON.parse(await project.read('package.json'))
    expect(pkg.devDependencies).toHaveProperty('@cypress/webpack-preprocessor')

    const config = JSON.parse(await project.read('cypress.json'))
    config.video = false
    await project.write('cypress.json', JSON.stringify(config))

    await project.run(`vue-cli-service test:e2e --headless`)
  })
} else {
  test('should work', () => {
    // empty spec to avoid jest bailing
  })
}
