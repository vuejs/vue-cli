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

  if (options.modernMode) {
    const ModernModePlugin = require('../../webpack/ModernModePlugin')
    const isModernBuild = !!process.env.VUE_CLI_MODERN_BUILD
    if (!isModernBuild) {
      // Inject plugin to extract build stats and write to disk
      config
        .plugin('modern-mode-legacy')
        .use(ModernModePlugin, [targetDir, false])
    } else {
      // Inject plugin to read non-modern build stats and inject HTML
      config
        .plugin('modern-mode-modern')
        .use(ModernModePlugin, [targetDir, true])
    }
  }

  const rawConfig = config.toConfig()

  // respect inline entry
  if (args.entry && !options.pages) {
    rawConfig.entry = { app: api.resolve(args.entry) }
  }

  return rawConfig
}
