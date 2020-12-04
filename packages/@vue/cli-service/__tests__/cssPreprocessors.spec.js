jest.setTimeout(30000)

const create = require('@vue/cli-test-utils/createTestProject')
const { defaultPreset } = require('@vue/cli/lib/options')

test('autoprefixer', async () => {
  const project = await create('css-autoprefixer', defaultPreset)

  await project.write('vue.config.js', 'module.exports = { filenameHashing: false }\n')

  const appVue = await project.read('src/App.vue')
  await project.write('src/App.vue', appVue.replace('#app {', '#app {\n  user-select: none;'))

  await project.run('vue-cli-service build')

  const css = await project.read('dist/css/app.css')
  expect(css).toMatch('-webkit-user-select')
})

test('CSS inline minification', async () => {
  const project = await create('css-inline-minification', defaultPreset)

  await project.write('vue.config.js', 'module.exports = { filenameHashing: false, css: { extract: false } }\n')

  const appVue = await project.read('src/App.vue')
  await project.write('src/App.vue',
    appVue.replace(
      '#app {',

      '#app {\n  height: calc(100px * 2);'
    )
  )
  await project.run('vue-cli-service build')
  const appJs = await project.read('dist/js/app.js')
  expect(appJs).not.toMatch('calc(100px')
  expect(appJs).toMatch('height:200px;')
})

// test('CSS minification', async () => {})

// test('Custom PostCSS plugins', async () => {
//   const project = await create('css-custom-postcss', defaultPreset)
// })
