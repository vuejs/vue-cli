module.exports = options => ({
  uglifyOptions: {
    compress: {
      // turn off flags with small gains to speed up minification
      arrows: false,
      collapse_vars: false, // 0.3kb
      comparisons: false,
      computed_props: false,
      hoist_props: false,
      inline: false,
      loops: false,
      negate_iife: false,
      properties: false,
      reduce_funcs: false,
      reduce_vars: false,
      switches: false
    },
    mangle: {
      safari10: true
    }
  },
  sourceMap: options.productionSourceMap,
  cache: true,
  parallel: true
})
