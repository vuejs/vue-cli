jest.setTimeout(30000)

const { assertServe, assertBuild } = require('./tsPlugin.helper')

const options = {
  plugins: {
    '@vue/cli-plugin-typescript': {
      classComponent: true
    }
  }
}

assertServe('ts-class-serve', options)
assertBuild('ts-class-build', options, async (project) => {
  const app = await project.read('src/App.vue')
  expect(app).toMatch(`export default class App extends Vue {`)
})
