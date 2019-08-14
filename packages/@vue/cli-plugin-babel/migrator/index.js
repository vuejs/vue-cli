const { chalk } = require('@vue/cli-shared-utils')

module.exports = (api) => {
  // TODO: backport this part to v3
  // if (api.fromVersion('<=3.5.3')) {
  //   // add core-js@2 as dependency
  //   api.extendPackage({
  //     dependencies: {
  //       'core-js': '^2.6.5'
  //     }
  //   })
  // }

  if (api.fromVersion('^3')) {
    api.extendPackage({
      dependencies: {
        'core-js': '^3.1.2'
      }
    }, true)

    // TODO: implement a codemod to migrate polyfills
    api.exitLog(`core-js has been upgraded from v2 to v3.
If you have any custom polyfills defined in ${chalk.yellow('babael.config.js')}, please be aware their names may have been changed.
For more complete changelog, see https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#300---20190319`)
  }
}
