const path = require('path')
const moduleAlias = require('module-alias')

const htmlWebpackPlugin4Path = path.dirname(require.resolve('html-webpack-plugin/package.json'))
// We have to use module-alias for html-webpack-plguin, as it is required by many other plugins
// as peer dependency for its `getHooks` API.
// Should add the alias as early as possible to avoid problems
// TODO: add debugging log here
moduleAlias.addAlias('html-webpack-plugin', htmlWebpackPlugin4Path)

/** @type {import('@vue/cli-service').ServicePlugin} */
module.exports = (api, options) => {
}
