const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')
const HtmlPwaPlugin = require('../lib/HtmlPwaPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { performance } = require('perf_hooks')
global.performance = performance

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

test('ReDos test', async () => {
  HtmlWebpackPlugin.getHooks = () => ({
    beforeEmit: {
      tapAsync: (id, handler) => {
        const hugeHtml = '<link rel="icon"'.repeat(100000) + '\u0000'
        const data = { html: hugeHtml }
        handler(data, (_err, result) => {})
      }
    },
    alterAssetTagGroups: {
      tapAsync: () => {}
    }
  })
  const plugin = new HtmlPwaPlugin()
  const fakeCompiler = {
    options: { output: { publicPath: '/' } },
    hooks: {
      compilation: {
        tap: (_id, cb) => {
          const fakeCompilation = {
            hooks: {
              processAssets: {
                tap: (_opts, fn) => {}
              }
            }
          }
          cb(fakeCompilation)
        }
      }
    }
  }
  const startTime = performance.now()
  plugin.apply(fakeCompiler)
  const endTime = performance.now()
  const timeTaken = endTime - startTime
  console.log(`time taken: ${timeTaken.toFixed(3)} ms`)
  expect(timeTaken).toBeLessThan(3000)
}, 3000)
