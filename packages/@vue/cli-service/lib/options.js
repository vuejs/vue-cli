const { createSchema, validate } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => joi.object({
  baseUrl: joi.string(),
  outputDir: joi.string(),
  compiler: joi.boolean(),
  cssModules: joi.boolean(),
  vueLoaderOptions: joi.object(),
  productionSourceMap: joi.boolean(),
  cssSourceMap: joi.boolean(),
  extractCSS: joi.boolean(),
  devServer: joi.object(),

  // known options from offical plugins
  lintOnSave: joi.boolean(),
  pwa: joi.object()
}))

exports.validate = options => validate(
  options,
  schema,
  // so that plugins can make use of custom options
  { allowUnknown: true }
)

exports.defaults = {
  // project deployment base
  baseUrl: '/',

  // where to output built files
  outputDir: 'dist',

  // boolean, use full build?
  compiler: false,

  // apply css modules to CSS files that doesn't end with .mdoule.css?
  cssModules: false,

  // vue-loader options
  vueLoaderOptions: {},

  // sourceMap for production build?
  productionSourceMap: true,

  // enable css source map?
  cssSourceMap: false,

  // boolean | Object, extract css?
  extractCSS: true,

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
}
