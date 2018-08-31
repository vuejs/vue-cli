const ModulesUtils = require('./modules')

const sizeTypes = ['stats', 'parsed', 'gzip']

exports.processStats = function (stats) {
  const rawModules = ModulesUtils.filterModules(stats.data.modules)

  const modulesPerSizeType = {}
  const analyzer = {}
  for (const sizeType of sizeTypes) {
    const modules = ModulesUtils.buildSortedModules(rawModules, sizeType)
    const modulesTotalSize = modules.reduce((total, module) => total + module.size, 0)
    const depModules = ModulesUtils.buildDepModules(modules)
    const depModulesTotalSize = depModules.reduce((total, module) => total + module.size, 0)
    modulesPerSizeType[sizeType] = {
      modulesTotalSize,
      depModules,
      depModulesTotalSize
    }

    const modulesTrees = ModulesUtils.buildModulesTrees(rawModules, sizeType)
    analyzer[sizeType] = {
      modulesTrees
    }
  }

  stats = {
    data: {
      errors: stats.data.errors,
      warnings: stats.data.warnings,
      assets: stats.data.assets,
      chunks: stats.data.chunks
    },
    computed: {
      modulesPerSizeType
    }
  }

  return {
    stats,
    analyzer
  }
}
