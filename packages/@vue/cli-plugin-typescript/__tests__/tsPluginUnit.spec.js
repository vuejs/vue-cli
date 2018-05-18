jest.setTimeout(40000)

const create = require('@vue/cli-test-utils/createTestProject')

test('mocha', async () => {
  const project = await create('ts-unit-mocha', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('jest', async () => {
  const project = await create('ts-unit-jest', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('jest w/ babel', async () => {
  const project = await create('ts-unit-jest-babel', {
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})
