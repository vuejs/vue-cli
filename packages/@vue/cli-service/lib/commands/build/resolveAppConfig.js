module.exports = (api, args, options) => {
  const config = api.resolveChainableWebpackConfig()
  const targetDir = api.resolve(args.dest || options.outputDir)

  // respect inline build destination in copy plugin
  if (args.dest && config.plugins.has('copy')) {
    config.plugin('copy').tap(args => {
      args[0][0].to = targetDir
      return args
    })
  }

  if (args.modern) {
    const ModernModePlugin = require('../../webpack/ModernModePlugin')
    if (!args.modernBuild) {
      // Inject plugin to extract build stats and write to disk
      config
        .plugin('modern-mode-legacy')
        .use(ModernModePlugin, [{
          targetDir,
          isModernBuild: false,
          unsafeInline: args['unsafe-inline']
        }])
    } else {
      // Inject plugin to read non-modern build stats and inject HTML
      config
        .plugin('modern-mode-modern')
        .use(ModernModePlugin, [{
          targetDir,
          isModernBuild: true,
          unsafeInline: args['unsafe-inline'],
          // as we may generate an addition file asset (if `no-unsafe-inline` specified)
          // we need to provide the correct directory for that file to place in
          jsDirectory: require('../../util/getAssetPath')(options, 'js')
        }])
    }
  }

  const rawConfig = api.resolveWebpackConfig(config)

  // respect inline entry
  if (args.entry && !options.pages) {
    rawConfig.entry = { app: api.resolve(args.entry) }
  }

  return rawConfig
}
