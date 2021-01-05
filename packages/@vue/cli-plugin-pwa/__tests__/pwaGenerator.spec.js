const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('inject import statement for service worker', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'core',
      apply: require('@vue/cli-service/generator'),
      options: {}
    },
    {
      id: 'pwa',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/main.js']).toMatch(`import './registerServiceWorker'`)
})

test('inject import statement for service worker (with TS)', async () => {
  const { files } = await generateWithPlugin([
    {
      id: 'core',
      apply: require('@vue/cli-service/generator'),
      options: {}
    },
    {
      id: 'typescript',
      apply: require('@vue/cli-plugin-typescript/generator'),
      options: {}
    },
    {
      id: 'pwa',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/main.ts']).toMatch(`import './registerServiceWorker'`)
})
