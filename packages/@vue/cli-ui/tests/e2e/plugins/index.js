// https://docs.cypress.io/guides/guides/plugins-guide.html
const path = require('path')

module.exports = (on, config) => {
  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js',
    execTimeout: 1000000,
    pageLoadTimeout: 1000000,
    requestTimeout: 1000000,
    responseTimeout: 1000000,
    env: {
      cwd: path.resolve(__dirname, '../../../../../test')
    }
  })
}
