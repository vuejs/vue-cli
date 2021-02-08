/** @type {import('@vue/cli').GeneratorPlugin} */
module.exports = (api) => {
  api.extendPackage({
    devDependencies: {
      'webpack': '^4.0.0'
    },
    // Force resolutions is more reliable than module-alias
    // Yarn and PNPM 5.10+ support this feature
    // So we'll try to use that whenever possible
    resolutions: {
      '@vue/cli-*/webpack': '^4.0.0',
      'html-webpack-plugin': '^4.5.1'
    }
  })

  // TODO: if uses sass, replace sass-loader@11 with sass-loader@10
}
