const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

function generateWithOptions (options) {
  return generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('../generator'),
      options
    }
  ])
}

test('sass (default)', async () => {
  const { pkg, files } = await generateWithOptions({
    cssPreprocessor: 'sass'
  })

  expect(files['src/App.vue']).toMatch('<style lang="scss">')
  expect(pkg).toHaveProperty(['devDependencies', 'sass'])
})

test('dart sass', async () => {
  const { pkg, files } = await generateWithOptions({
    cssPreprocessor: 'dart-sass'
  })

  expect(files['src/App.vue']).toMatch('<style lang="scss">')
  expect(pkg).toHaveProperty(['devDependencies', 'sass'])
})

test('Vue 3', async () => {
  const { pkg, files } = await generateWithOptions({
    vueVersion: '3'
  })

  expect(pkg.dependencies.vue).toMatch('^3')

  expect(files['src/main.js']).toMatch(`import { createApp } from 'vue'`)

  expect(files['src/App.vue']).not.toMatch('<div id="app">')
})
