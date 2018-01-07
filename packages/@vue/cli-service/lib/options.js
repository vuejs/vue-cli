const { createSchema, validate } = require('@vue/cli-shared-utils')

const schema = createSchema(joi => joi.object({
  base: joi.string(),
  outputDir: joi.string(),
  staticDir: joi.string(),
  compiler: joi.boolean(),
  cssModules: joi.boolean(),
  vueLoaderOptions: joi.object(),
  productionSourceMap: joi.boolean(),
  cssSourceMap: joi.boolean(),
  extractCSS: joi.boolean(),
  lintOnSave: joi.boolean(),
  devServer: joi.object()
}))

exports.validate = options => validate(options, schema)

exports.defaults = {
  // project deployment base
  base: '/',

  // where to output built files
  outputDir: 'dist',

  // where to generate static assets under outputDir
  staticDir: 'static',

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
