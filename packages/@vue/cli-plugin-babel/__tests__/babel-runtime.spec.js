jest.setTimeout(80000)

const { defaultPreset } = require('@vue/cli/lib/options')
const create = require('@vue/cli-test-utils/createTestProject')
const serve = require('@vue/cli-test-utils/serveWithPuppeteer')

test('should add polyfills for code in @babel/runtime', async () => {
  const project = await create('babel-runtime-polyfills', defaultPreset)

  await project.write('src/main.js', `
  const x = function () {
    setTimeout(
      // eslint-disable-next-line
      () => console.log(...arguments), 100
    );
  }
  x(1, 2)
  `)

  await project.run('vue-cli-service build --mode development')
  const vendorFile = await project.read('dist/js/chunk-vendors.js')

  // iterableToArray is used to transform `console.log(...arguments)`
  expect(vendorFile).toMatch('iterableToArray')
  // with inline helpers, preset-env can detect the symbol polyfill is required
  // (because the implementation of `iterableToArray` relies on it)
  // however, with transform-runtime plugin, helpers are only references to @babel/runtime modules
  // so we need to make sure polyfill detection is enabled for @babel/runtime too
  expect(vendorFile).toMatch('es.symbol')
})

test('should not transpile babel helpers multiple times', async () => {
  const project = await create('babel-runtime-helpers', defaultPreset)

  const mainjs = await project.read('src/main.js')
  await project.write('src/main.js', `
  // eslint-disable-next-line
  console.log(typeof Symbol('a'))

  ${mainjs}
  `)

  // if the typeof symbol helper is transpiled recursively,
  // there would be an error thrown and the page would be empty
  await serve(
    () => project.run('vue-cli-service serve'),
    async ({ helpers }) => {
      const msg = `Welcome to Your Vue.js App`
      expect(await helpers.getText('h1')).toMatch(msg)
    }
  )
})

// #4742 core-js-pure imports are likely to be caused by
// incorrect configuration of @babel/plugin-transform-runtime
test('should not introduce polyfills from core-js-pure', async () => {
  const project = await create('babel-runtime-core-js-pure', defaultPreset)

  await project.write('src/main.js', `
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  methods: {
    myfunc: async function () {}
  }
}).$mount('#app')
  `)

  await project.run('vue-cli-service build --mode development')
  const vendorFile = await project.read('dist/js/chunk-vendors.js')

  expect(vendorFile).not.toMatch('core-js-pure')
})
