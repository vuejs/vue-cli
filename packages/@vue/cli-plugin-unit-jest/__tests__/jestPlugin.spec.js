jest.setTimeout(20000)

const create = require('@vue/cli-test-utils/createTestProject')

test('should work', async () => {
  const project = await create('unit-jest', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('should respect jest testMatch config', async () => {
  const project = await create('unit-jest-package.json', {
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
    await project.run(`vue-cli-service test:unit`)
  } catch (e) {
    result = e
  }
  expect(result.stdout).toMatch('testMatch: custom-test-directory/my.spec.js')
  expect(result.stdout).toMatch('No tests found')
})

test('should respect jest.config.js testMatch config', async () => {
  const project = await create('unit-jest-jest.config.js', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    },
    useConfigFiles: true
  })
  await project.write('jest.config.js', `
  module.exports = ${JSON.stringify({
    testMatch: ['custom-test-directory/my.spec.js']
  })}
  `)

  let result
  try {
    await project.run(`vue-cli-service test:unit`)
  } catch (e) {
    result = e
  }
  expect(result.stdout).toMatch('testMatch: custom-test-directory/my.spec.js')
  expect(result.stdout).toMatch('No tests found')
})

test('should work without Babel', async () => {
  const project = await create('jest-without-babel', {
    plugins: {
      '@vue/cli-plugin-unit-jest': {}
    },
    useConfigFiles: true
  })
  await project.run(`vue-cli-service test:unit`)
})
