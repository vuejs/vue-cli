module.exports = (api) => {
  if (api.fromVersion('<= 5.0.0-alpha.4')) {
    api.render(files => {
      if (!files['tsconfig.json']) {
        return
      }

      files['tsconfig.json'] = files['tsconfig.json'].replace('"@wdio/sync"', '"webdriverio/sync"')
    })
  }
}
