/**
 * A basic Nightwatch custom command
 *  which demonstrates usage of ES6 async/await instead of using callbacks.
 *  The command name is the filename and the exported "command" function is the command.
 *
 * Example usage:
 *   browser.openHomepage();
 *
 * For more information on writing custom commands see:
 *   https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
 *
 */
module.exports = {
  command: async function () {
    // Other Nightwatch commands are available via "this"
    // .init() simply calls .url() command with the value of the "launch_url" setting
    this.init()
    this.waitForElementVisible('#app')

    const result = await this.elements('css selector', '#app ul')
    this.assert.strictEqual(result.value.length, 3)
  }
}
