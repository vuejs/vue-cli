// this file will be renamed to hotfix.js if the package is installed by npm 6
module.exports = (api) => {
  api.extendPackage({
    dependencies: {
      postcss: '^8.2.6'
    }
  })
}
