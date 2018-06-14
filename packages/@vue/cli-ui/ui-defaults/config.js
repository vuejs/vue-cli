module.exports = api => {
  api.describeConfig({
    id: 'vue-cli',
    name: 'Vue CLI',
    description: 'vue-webpack.config.vue-cli.description',
    link: 'https://cli.vuejs.org/config/',
    files: {
      vue: {
        js: ['vue.config.js']
      }
    },
    icon: '/public/vue-cli.png',
    onRead: ({ data }) => ({
      prompts: [
        {
          name: 'baseUrl',
          type: 'input',
          default: '/',
          value: data.vue && data.vue.baseUrl,
          message: 'vue-webpack.config.vue-cli.baseUrl.label',
          description: 'vue-webpack.config.vue-cli.baseUrl.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#baseurl'
        },
        {
          name: 'outputDir',
          type: 'input',
          default: 'dist',
          value: data.vue && data.vue.outputDir,
          validate: input => !!input,
          message: 'vue-webpack.config.vue-cli.outputDir.label',
          description: 'vue-webpack.config.vue-cli.outputDir.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#outputdir'
        },
        {
          name: 'assetsDir',
          type: 'input',
          default: '',
          value: data.vue && data.vue.assetsDir,
          message: 'vue-webpack.config.vue-cli.assetsDir.label',
          description: 'vue-webpack.config.vue-cli.assetsDir.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#assetsdir'
        },
        {
          name: 'runtimeCompiler',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.runtimeCompiler,
          message: 'vue-webpack.config.vue-cli.runtimeCompiler.label',
          description: 'vue-webpack.config.vue-cli.runtimeCompiler.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#runtimecompiler'
        },
        {
          name: 'productionSourceMap',
          type: 'confirm',
          default: true,
          value: data.vue && data.vue.productionSourceMap,
          message: 'vue-webpack.config.vue-cli.productionSourceMap.label',
          description: 'vue-webpack.config.vue-cli.productionSourceMap.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#productionsourcemap'
        },
        {
          name: 'parallel',
          type: 'confirm',
          default: require('os').cpus().length > 1,
          value: data.vue && data.vue.parallel,
          message: 'vue-webpack.config.vue-cli.parallel.label',
          description: 'vue-webpack.config.vue-cli.parallel.description',
          group: 'vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#parallel'
        },
        {
          name: 'css.modules',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.css && data.vue.css.modules,
          message: 'vue-webpack.config.vue-cli.css.modules.label',
          description: 'vue-webpack.config.vue-cli.css.modules.description',
          group: 'vue-webpack.config.vue-cli.groups.css',
          link: 'https://cli.vuejs.org/config/#css-modules'
        },
        {
          name: 'css.extract',
          type: 'confirm',
          default: true,
          value: data.vue && data.vue.css && data.vue.css.extract,
          message: 'vue-webpack.config.vue-cli.css.extract.label',
          description: 'vue-webpack.config.vue-cli.css.extract.description',
          group: 'vue-webpack.config.vue-cli.groups.css',
          link: 'https://cli.vuejs.org/config/#css-extract'
        },
        {
          name: 'css.sourceMap',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.css && data.vue.css.sourceMap,
          message: 'vue-webpack.config.vue-cli.css.sourceMap.label',
          description: 'vue-webpack.config.vue-cli.css.sourceMap.description',
          group: 'vue-webpack.config.vue-cli.groups.css',
          link: 'https://cli.vuejs.org/config/#css-sourcemap'
        }
      ]
    }),
    onWrite: async ({ api, prompts }) => {
      const vueData = {}
      for (const prompt of prompts) {
        vueData[prompt.id] = await api.getAnswer(prompt.id)
      }
      api.setData('vue', vueData)
    }
  })
}
