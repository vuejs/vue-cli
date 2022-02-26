module.exports = (api) => {
  if (api.fromVersion('<= 5.0.0-alpha.4')) {
    api.render((files) => {
      if (!files['tsconfig.json']) {
        return
      }

      files['tsconfig.json'] = files['tsconfig.json'].replace(
        '"@wdio/sync"',
        '"webdriverio/sync"'
      )
      if (!/"expect-webdriverio"/.test(files['tsconfig.json'])) {
        files['tsconfig.json'] = files['tsconfig.json'].replace(
          '"@wdio/mocha-framework",',
          '"@wdio/mocha-framework",\n      "expect-webdriverio",'
        )
      }
    })
  }

  if (api.fromVersion('<= 5.0.0-beta.4')) {
    api.extendPackage({
      devDependencies: {
        '@wdio/sync': '^7.0.7'
      }
    })
  }
}
