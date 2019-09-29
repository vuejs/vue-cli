/**
 * A very basic Nightwatch custom command. The command name is the filename and the
 *  exported "command" function is the command.
 *
 * Example usage:
 *   browser.customExecute(function() {
 *     console.log('Hello from the browser window')
 *   });
 *
 * For more information on writing custom commands see:
 *   https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
 *
 * @param {*} data
 */
exports.command = function command (data) {
  // Other Nightwatch commands are available via "this"

  // .execute() inject a snippet of JavaScript into the page for execution.
  //  the executed script is assumed to be synchronous.
  //
  // See https://nightwatchjs.org/api/execute.html for more info.
  //
  this.execute(
    // The function argument is converted to a string and sent to the browser
    function (argData) { return argData },

    // The arguments for the function to be sent to the browser are specified in this array
    [data],

    function (result) {
      // The "result" object contains the result of what we have sent back from the browser window
      console.log('custom execute result:', result.value)
    }
  )

  return this
}
