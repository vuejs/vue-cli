jest.setTimeout(300000)

const generateWithPlugin = require('@vue/cli-test-utils/generateWithPlugin')
const createOutside = require('@vue/cli-test-utils/createUpgradableProject')

test('Vue 3 base', async () => {
  const { pkg } = await generateWithPlugin([
    {
      id: '@vue/cli-service',
      apply: require('@vue/cli-service/generator'),
      options: {
        vueVersion: '3'
      }
    },
    {
      id: '@vue/cli-plugineslint',
      apply: require('../generator'),
      options: {}
    }
  ])

  expect(pkg.scripts.lint).toBeTruthy()
  expect(pkg.eslintConfig.extends).toEqual([
    'plugin:vue/vue3-essential', 'eslint:recommended'
  ])
})

test('Should allow fragments in Vue 3 projects', async () => {
  const { write, run } = await createOutside('eslint-vue3-fragment', {
    vueVersion: '3',
    plugins: {
      '@vue/cli-plugin-eslint': {}
    }
  })
  await write('src/App.vue', `<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>
`)

  await run('vue-cli-service lint')
})
