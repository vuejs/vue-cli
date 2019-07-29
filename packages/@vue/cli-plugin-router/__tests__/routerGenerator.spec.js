const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { files, pkg } = await generateWithPlugin({
    id: 'router',
    apply: require('../generator'),
    options: {}
  })

  expect(files['src/router/index.js']).toBeTruthy()
  expect(files['src/router/index.js']).not.toMatch('history')
  expect(files['src/views/About.vue']).toBeTruthy()
  expect(files['src/views/Home.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('#nav a.router-link-exact-active')

  expect(pkg.dependencies).toHaveProperty('vue-router')
})

test('history mode', async () => {
  const { files, pkg } = await generateWithPlugin({
    id: 'router',
    apply: require('../generator'),
    options: {
      historyMode: true
    }
  })

  expect(files['src/router/index.js']).toBeTruthy()
  expect(files['src/router/index.js']).toMatch('history')
  expect(files['src/views/About.vue']).toBeTruthy()
  expect(files['src/views/Home.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('#nav a.router-link-exact-active')

  expect(pkg.dependencies).toHaveProperty('vue-router')
})

test('use with Babel', async () => {
  const { pkg, files } = await generateWithPlugin([
    {
      id: 'babel',
      apply: require('@vue/cli-plugin-babel/generator'),
      options: {}
    },
    {
      id: 'router',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/router/index.js']).toBeTruthy()
  expect(files['src/router/index.js']).toMatch('component: () => import')
  expect(files['src/views/About.vue']).toBeTruthy()
  expect(files['src/views/Home.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('#nav a.router-link-exact-active')

  expect(pkg.dependencies).toHaveProperty('vue-router')
})
