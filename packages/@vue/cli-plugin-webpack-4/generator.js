const { semver } = require('@vue/cli-shared-utils')

/** @type {import('@vue/cli').GeneratorPlugin} */
module.exports = (api) => {
  api.extendPackage({
    devDependencies: {
      webpack: '^4.0.0'
    },
    // Force resolutions is more reliable than module-alias
    // Yarn and PNPM 5.10+ support this feature
    // So we'll try to use that whenever possible
    resolutions: {
      '@vue/cli-*/webpack': '^4.0.0',
      'html-webpack-plugin': '^4.5.1'
    }
  })

  api.extendPackage(
    (pkg) => {
      const oldDevDeps = pkg.devDependencies
      const newDevDeps = {}
      const unsupportedRanges = {
        'less-loader': '>= 8.0.0',
        'sass-loader': '>= 11.0.0',
        'stylus-loader': '>= 5.0.0'
      }
      const maxSupportedRanges = {
        'less-loader': '^7.3.0',
        'sass-loader': '^10.1.1',
        'stylus-loader': '^4.3.3'
      }

      for (const loader of ['less-loader', 'sass-loader', 'stylus-loader']) {
        if (
          oldDevDeps[loader] &&
          semver.intersects(oldDevDeps[loader], unsupportedRanges[loader])
        ) {
          newDevDeps[loader] = maxSupportedRanges[loader]
        }
      }

      const toMerge = { devDependencies: newDevDeps }

      return toMerge
    },
    {
      warnIncompatibleVersions: false
    }
  )
}
