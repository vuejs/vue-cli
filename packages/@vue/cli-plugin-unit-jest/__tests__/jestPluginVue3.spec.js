jest.setTimeout(300000)

const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

test('should work with Vue 3', async () => {
  const project = await createOutside('unit-jest-vue-3', {
    vueVersion: '3',
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies['@vue/test-utils']).toMatch('^2')
  expect(pkg.devDependencies['@vue/vue3-jest']).toMatch('^27')
  expect(pkg.devDependencies.jest).toMatch('^27')
  expect(pkg.devDependencies['babel-jest']).toMatch('^27')
  await project.run(`vue-cli-service test:unit`)
})

test('should work with Vue 3 and TS', async () => {
  const project = await createOutside('unit-jest-vue-3', {
    vueVersion: '3',
    plugins: {
      '@vue/cli-plugin-typescript': {},
      '@vue/cli-plugin-unit-jest': {}
    }
  })
  const pkg = JSON.parse(await project.read('package.json'))
  expect(pkg.devDependencies['@vue/test-utils']).toMatch('^2')
  expect(pkg.devDependencies['@vue/vue3-jest']).toMatch('^27')
  expect(pkg.devDependencies.jest).toMatch('^27')
  expect(pkg.devDependencies['ts-jest']).toMatch('^27')
  await project.run(`vue-cli-service test:unit`)
})
