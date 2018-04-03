jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-jest', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test`)
})

test('should respect jest testMatch config', async () => {
  const project = await create('unit-jest', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  const config = JSON.parse(await project.read('package.json'))
  config.jest.testMatch = ['custom-test-directory/my.spec.js']

  await project.write('package.json', JSON.stringify(config))

  let result
  try {
    await project.run(`vue-cli-service test`)
  } catch (e) {
    result = e
  }
  console.log(result)
  expect(result.stdout).toMatch('custom-test-directory/my.spec.js')
})
