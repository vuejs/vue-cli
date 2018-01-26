module.exports = (api, options) => {
  api.chainWebpack(webpackConfig => {
    if (process.env.NODE_ENV === 'production') {
      webpackConfig
        .devtool('source-map')
        .output
          .filename(`js/[name].[chunkhash:8].js`)
          .chunkFilename(`js/[id].[chunkhash:8].js`)

      // keep module.id stable when vendor modules does not change
      webpackConfig
        .plugin('hash-module-ids')
          .use(require('webpack/lib/HashedModuleIdsPlugin'))

      // enable scope hoisting / tree shaking
      webpackConfig
        .plugin('module-concatenation')
          .use(require('webpack/lib/optimize/ModuleConcatenationPlugin'))

      // minify HTML
      webpackConfig
        .plugin('html')
          .tap(([options]) => [Object.assign(options, {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
              // more options:
              // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
          })])

      // optimize CSS (dedupe)
      webpackConfig
        .plugin('optimize-css')
          .use(require('optimize-css-assets-webpack-plugin'), [
            options.productionSourceMap && options.cssSourceMap
              ? { safe: true, map: { inline: false }}
              : { safe: true }
          ])

      // minify JS
      const UglifyPlugin = require('uglifyjs-webpack-plugin')
      const uglifyPluginOptions = {
        uglifyOptions: {
          compress: {
            // turn off flags with small gains to speed up minification
            arrows: false,
            collapse_vars: false, // 0.3kb
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,

            // a few flags with noticable gains/speed ratio
            // numbers based on out of the box vendor bundle
            booleans: true, // 0.7kb
            if_return: true, // 0.4kb
            sequences: true, // 0.7kb
            unused: true, // 2.3kb

            // required features to drop conditional branches
            conditionals: true,
            dead_code: true,
            evaluate: true
          }
        },
        sourceMap: options.productionSourceMap,
        cache: true,
        parallel: true
      }
      // disable during tests to speed things up
      if (!process.env.VUE_CLI_TEST) {
        webpackConfig
          .plugin('uglify')
            .use(UglifyPlugin, [uglifyPluginOptions])
      }

      const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')

      // Chunk splits
      if (!options.dll) {
        // extract vendor libs into its own chunk for better caching, since they
        // are more likely to stay the same.
        webpackConfig
          .plugin('split-vendor')
            .use(CommonsChunkPlugin, [{
              name: 'vendor',
              minChunks (module) {
                // any required modules inside node_modules are extracted to vendor
                return (
                  module.resource &&
                  /\.js$/.test(module.resource) &&
                  module.resource.indexOf(`node_modules`) > -1
                )
              }
            }])

        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        webpackConfig
          .plugin('split-manifest')
            .use(CommonsChunkPlugin, [{
              name: 'manifest',
              minChunks: Infinity
            }])

        // inline the manifest chunk into HTML
        webpackConfig
          .plugin('inline-manifest')
            .use(require('../webpack/InlineSourcePlugin'), [{
              include: /manifest\..*\.js$/
            }])

        // since manifest is inlined, don't preload it anymore
        webpackConfig
          .plugin('preload')
            .tap(([options]) => {
              options.fileBlacklist.push(/manifest\..*\.js$/)
              return [options]
            })
      }

      // This CommonsChunkPlugin instance extracts shared chunks from async
      // chunks and bundles them in a separate chunk, similar to the vendor chunk
      // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
      webpackConfig
        .plugin('split-vendor-async')
          .use(CommonsChunkPlugin, [{
            name: 'app',
            async: 'vendor-async',
            children: true,
            minChunks: 3
          }])

      // DLL
      if (options.dll) {
        const webpack = require('webpack')
        const resolveClientEnv = require('../util/resolveClientEnv')
        const dllEntries = Array.isArray(options.dll)
          ? options.dll
          : Object.keys(api.service.pkg.dependencies)

        webpackConfig
          .plugin('dll')
            .use(require('autodll-webpack-plugin'), [{
              inject: true,
              inherit: true,
              path: 'js/',
              context: api.resolve('.'),
              filename: '[name].[hash:8].js',
              entry: {
                'vendor': [
                  ...dllEntries,
                  'vue-loader/lib/component-normalizer'
                ]
              },
              plugins: [
                new webpack.DefinePlugin(resolveClientEnv(options.baseUrl)),
                new UglifyPlugin(uglifyPluginOptions)
              ]
            }])
            .after('preload')
      }

      // copy static assets in public/
      webpackConfig
        .plugin('copy')
          .use(require('copy-webpack-plugin'), [[{
            from: api.resolve('public'),
            to: api.resolve(options.outputDir),
            ignore: ['index.html', '.*']
          }]])

      // TODO parallelazation
      // thread-loader doesn't seem to have obvious effect because vue-loader
      // offloads most of the work to other loaders. We may need to re-think
      // vue-loader implementation in order to better take advantage of
      // parallelazation

      // webpackConfig.module
      //   .rule('vue')
      //     .use('thread-loader')
      //       .before('vue-loader')
      //       .loader(require.resolve('thread-loader'))
      //       .options({ name: 'vue' })
    }
  })
}
