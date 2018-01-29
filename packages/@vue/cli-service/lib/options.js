const { createSchema, validate } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => joi.object({
  baseUrl: joi.string(),
  outputDir: joi.string(),
  compiler: joi.boolean(),
  productionSourceMap: joi.boolean(),
  vueLoader: joi.object(),
  parallel: joi.boolean(),
  dll: joi.alternatives().try(
    joi.boolean(),
    joi.array().items(joi.string())
  ),
  css: joi.object({
    modules: joi.boolean(),
    extract: joi.boolean(),
    sourceMap: joi.boolean(),
    loaderOptions: joi.object({
      sass: joi.object(),
      less: joi.object(),
      stylus: joi.object()
    })
  }),
  devServer: joi.object(),
  // known options from offical plugins
  lintOnSave: joi.boolean()
}))

exports.validate = options => validate(
  options,
  schema,
  // so that plugins can make use of custom options
  { allowUnknown: true }
)

exports.defaults = () => ({
  // project deployment base
  baseUrl: '/',

  // where to output built files
  outputDir: 'dist',

  // boolean, use full build?
  compiler: false,

  // vue-loader options
  vueLoader: {},

  // sourceMap for production build?
  productionSourceMap: true,

  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require('os').cpus().length > 1,

  // split vendors using autoDLLPlugin?
  // can be an explicit list of dependencies to include in the DLL chunk.
  dll: false,

  css: {
    // boolean | Object, extract css?
    extract: true,
    // apply css modules to CSS files that doesn't end with .module.css?
    modules: false,
    sourceMap: false,
    loaderOptions: {}
  },

  // whether to use eslint-loader
  lintOnSave: false,

  devServer: {
  /*
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null, // string | Object
    before: app => {}
  */
  }
})
