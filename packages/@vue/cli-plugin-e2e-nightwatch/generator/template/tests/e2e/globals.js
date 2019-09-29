///////////////////////////////////////////////////////////////////////////////////
// Refer to the entire list of global config settings here:
// https://github.com/nightwatchjs/nightwatch/blob/master/lib/settings/defaults.js#L16
//
// More info on test globals:
//   https://nightwatchjs.org/gettingstarted/configuration/#test-globals
//
///////////////////////////////////////////////////////////////////////////////////

module.exports = {
  // this controls whether to abort the test execution when an assertion failed and skip the rest
  // it's being used in waitFor commands and expect assertions
  abortOnAssertionFailure: true,

  // this will overwrite the default polling interval (currently 500ms) for waitFor commands
  // and expect assertions that use retry
  waitForConditionPollInterval: 500,

  // default timeout value in milliseconds for waitFor commands and implicit waitFor value for
  // expect assertions
  waitForConditionTimeout: 5000,

  'default': {
    /*
    The globals defined here are available everywhere in any test env
    */

    /*
    myGlobal: function() {
      return 'I\'m a method';
    }
    */
  },

  'firefox': {
    /*
    The globals defined here are available only when the chrome testing env is being used
       i.e. when running with --env firefox
    */
    /*
     * myGlobal: function() {
     *   return 'Firefox specific global';
     * }
     */
  },

  /////////////////////////////////////////////////////////////////
  // Global hooks
  // - simple functions which are executed as part of the test run
  // - take a callback argument which can be called when an async
  //    async operation is finished
  /////////////////////////////////////////////////////////////////
  /**
   * executed before the test run has started, so before a session is created
   */
  /*
  before(cb) {
    //console.log('global before')
    cb();
  },
  */

  /**
   * executed before every test suite has started
   */
  /*
  beforeEach(browser, cb) {
    //console.log('global beforeEach')
    cb();
  },
  */

  /**
   * executed after every test suite has ended
   */
  /*
  afterEach(browser, cb) {
    browser.perform(function() {
      //console.log('global afterEach')
      cb();
    });
  },
  */

  /**
   * executed after the test run has finished
   */
  /*
  after(cb) {
    //console.log('global after')
    cb();
  },
  */

  /////////////////////////////////////////////////////////////////
  // Global reporter
  //  - define your own custom reporter
  /////////////////////////////////////////////////////////////////
  /*
  reporter(results, cb) {
    cb();
  }
   */
}
