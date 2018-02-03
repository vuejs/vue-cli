// https://docs.cypress.io/guides/guides/plugins-guide.html

module.exports = (on, config) => {
  return Object.assign({}, config, {
    fixturesFolder: 'test/e2e/fixtures',
    integrationFolder: 'test/e2e/specs',
    screenshotsFolder: 'test/e2e/screenshots',
    videosFolder: 'test/e2e/videos',
    supportFile: 'test/e2e/support/index.js'
  })
}
