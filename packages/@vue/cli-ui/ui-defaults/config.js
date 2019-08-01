module.exports = api => {
  api.describeConfig({
    id: 'org.vue.vue-cli',
    name: 'Vue CLI',
    description: 'org.vue.vue-webpack.config.vue-cli.description',
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
          name: 'publicPath',
          type: 'input',
          default: '/',
          value: data.vue && data.vue.publicPath,
          message: 'org.vue.vue-webpack.config.vue-cli.publicPath.label',
          description: 'org.vue.vue-webpack.config.vue-cli.publicPath.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#publicPath'
        },
        {
          name: 'outputDir',
          type: 'input',
          default: 'dist',
          value: data.vue && data.vue.outputDir,
          validate: input => !!input,
          message: 'org.vue.vue-webpack.config.vue-cli.outputDir.label',
          description: 'org.vue.vue-webpack.config.vue-cli.outputDir.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#outputdir'
        },
        {
          name: 'assetsDir',
          type: 'input',
          default: '',
          value: data.vue && data.vue.assetsDir,
          message: 'org.vue.vue-webpack.config.vue-cli.assetsDir.label',
          description: 'org.vue.vue-webpack.config.vue-cli.assetsDir.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#assetsdir'
        },
        {
          name: 'runtimeCompiler',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.runtimeCompiler,
          message: 'org.vue.vue-webpack.config.vue-cli.runtimeCompiler.label',
          description: 'org.vue.vue-webpack.config.vue-cli.runtimeCompiler.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#runtimecompiler'
        },
        {
          name: 'productionSourceMap',
          type: 'confirm',
          default: true,
          value: data.vue && data.vue.productionSourceMap,
          message: 'org.vue.vue-webpack.config.vue-cli.productionSourceMap.label',
          description: 'org.vue.vue-webpack.config.vue-cli.productionSourceMap.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#productionsourcemap'
        },
        {
          name: 'parallel',
          type: 'confirm',
          default: require('os').cpus().length > 1,
          value: data.vue && data.vue.parallel,
          message: 'org.vue.vue-webpack.config.vue-cli.parallel.label',
          description: 'org.vue.vue-webpack.config.vue-cli.parallel.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.general',
          link: 'https://cli.vuejs.org/config/#parallel'
        },
        {
          name: 'css.modules',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.css && data.vue.css.modules,
          message: 'org.vue.vue-webpack.config.vue-cli.css.modules.label',
          description: 'org.vue.vue-webpack.config.vue-cli.css.modules.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.css',
          link: 'https://cli.vuejs.org/config/#css-modules'
        },
        {
          name: 'css.extract',
          type: 'confirm',
          default: true,
          value: data.vue && data.vue.css && data.vue.css.extract,
          message: 'org.vue.vue-webpack.config.vue-cli.css.extract.label',
          description: 'org.vue.vue-webpack.config.vue-cli.css.extract.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.css',
          link: 'https://cli.vuejs.org/config/#css-extract'
        },
        {
          name: 'css.sourceMap',
          type: 'confirm',
          default: false,
          value: data.vue && data.vue.css && data.vue.css.sourceMap,
          message: 'org.vue.vue-webpack.config.vue-cli.css.sourceMap.label',
          description: 'org.vue.vue-webpack.config.vue-cli.css.sourceMap.description',
          group: 'org.vue.vue-webpack.config.vue-cli.groups.css',
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
