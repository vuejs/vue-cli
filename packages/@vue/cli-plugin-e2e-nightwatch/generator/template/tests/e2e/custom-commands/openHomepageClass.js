/**
 * A class-based Nightwatch custom command which is a variation of the openHomepage.js command.
 *  The command name is the filename and class needs to contain a "command" method.
 *
 * Example usage:
 *   browser.openHomepageClass();
 *
 * For more information on writing custom commands see:
 *   https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
 *
 */

const assert = require('assert')

module.exports = class {
  async command () {
    // Other Nightwatch commands are available via "this.api"
    this.api.init()
    this.api.waitForElementVisible('#app')

    const result = await this.api.elements('css selector', '#app ul')
    assert.strictEqual(result.value.length, 3)
  }
}
