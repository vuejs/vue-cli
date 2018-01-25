// https://docs.cypress.io/guides/guides/plugins-guide.html

module.exports = (on, config) => {
  config.fixturesFolder = 'test/e2e/fixtures'
  config.integrationFolder = 'test/e2e/specs'
  config.screenshotsFolder = 'test/e2e/screenshots'
  config.videosFolder = 'test/e2e/videos'
  config.supportFile = 'test/e2e/support/index.js'
  return config
}
