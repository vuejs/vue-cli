module.exports = (api) => {
  if (api.fromVersion('<=3.5.3')) {
    // add core-js@2 as dependency
    api.extendPackage({
      dependencies: {
        'core-js': '^2.6.5'
      }
    })
  }

  if (api.fromVersion('^3')) {
    // TODO: update core-js@2 to core-js@3
  }

  api.exitLog('Full changelog: maybe-some-random-gist-url')
}
