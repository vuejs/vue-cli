const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('inject import statement for service worker', async () => {
  const mockMain = (
    `import Vue from 'vue'\n` +
    `import Bar from './Bar.vue'`
  )
  const { files } = await generateWithPlugin([
    {
      id: 'files',
      apply: api => {
        api.render(files => {
          files['src/main.js'] = mockMain
        })
      },
      options: {}
    },
    {
      id: 'pwa',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/main.js']).toMatch(`${mockMain}\nimport './registerServiceWorker'`)
})
