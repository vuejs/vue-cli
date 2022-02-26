const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')

test('base', async () => {
  const { files, pkg } = await generateWithPlugin({
    id: 'router',
    apply: require('../generator'),
    options: {}
  })

  expect(files['src/router/index.js']).toBeTruthy()
  expect(files['src/router/index.js']).not.toMatch('history')
  expect(files['src/views/AboutView.vue']).toBeTruthy()
  expect(files['src/views/HomeView.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('nav a.router-link-exact-active')

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
  expect(files['src/views/AboutView.vue']).toBeTruthy()
  expect(files['src/views/HomeView.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('nav a.router-link-exact-active')

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
  expect(files['src/views/AboutView.vue']).toBeTruthy()
  expect(files['src/views/HomeView.vue']).toBeTruthy()
  expect(files['src/App.vue']).toMatch('<router-link to="/">Home</router-link>')
  expect(files['src/App.vue']).not.toMatch('<script>')
  expect(files['src/App.vue']).toMatch('nav a.router-link-exact-active')

  expect(pkg.dependencies).toHaveProperty('vue-router')
})

test('use with Vue 3', async () => {
  const { files, pkg } = await generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('@vue/cli-service/generator'),
      options: {
        vueVersion: '3'
      }
    },
    {
      id: '@vue/cli-plugin-router',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(files['src/router/index.js']).toBeTruthy()
  expect(files['src/router/index.js']).toMatch('createRouter')
  expect(files['src/router/index.js']).toMatch('history: createWebHashHistory()')

  expect(files['src/main.js']).toMatch('.use(router)')

  expect(files['src/App.vue']).not.toMatch('<div id="app">')

  expect(pkg.dependencies).toHaveProperty('vue-router')
  expect(pkg.dependencies['vue-router']).toMatch('^4')
})

test('Vue 3 + History Mode', async () => {
  const { files } = await generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('@vue/cli-service/generator'),
      options: {
        vueVersion: '3'
      }
    },
    {
      id: '@vue/cli-plugin-router',
      apply: require('../generator'),
      options: {
        historyMode: true
      }
    }
  ])

  expect(files['src/router/index.js']).toMatch(/import {.*createWebHistory/)
  expect(files['src/router/index.js']).toMatch('history: createWebHistory(process.env.BASE_URL)')
})

test('Vue 3 + TypeScript', async () => {
  const { files } = await generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('@vue/cli-service/generator'),
      options: {
        vueVersion: '3'
      }
    },
    {
      id: '@vue/cli-plugin-router',
      apply: require('../generator'),
      options: {}
    },
    {
      id: '@vue/cli-plugin-typescript',
      apply: require('@vue/cli-plugin-typescript/generator'),
      options: {}
    }
  ])

  expect(files['src/router/index.ts']).toBeTruthy()
  expect(files['src/router/index.ts']).toMatch(/import {.*RouteRecordRaw/)
  expect(files['src/router/index.ts']).toMatch('const routes: Array<RouteRecordRaw> =')
})
