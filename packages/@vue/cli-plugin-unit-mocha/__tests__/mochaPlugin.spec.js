jest.setTimeout(3000000)

const create = require('@vue/cli-test-utils/createTestProject')
const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

test('should work', async () => {
  const project = await create('unit-mocha', {
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  await project.run(`vue-cli-service test:unit`)
})

test('should work with Vue 3', async () => {
  const project = await createOutside('unit-mocha-vue-3', {
    vueVersion: '3',
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies['@vue/test-utils']).toMatch('^2')
  await project.run(`vue-cli-service test:unit`)
})

test('should work with Vue 3 + TS', async () => {
  const project = await createOutside('unit-mocha-vue-3-ts', {
    vueVersion: '3',
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-mocha': {}
    }
  })
  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies['@vue/test-utils']).toMatch('^2')
  await project.run(`vue-cli-service test:unit`)
})
