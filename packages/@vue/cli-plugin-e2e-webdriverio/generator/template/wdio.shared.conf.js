/* eslint-disable no-unused-vars */
const path = require('path')

exports.config = {
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: [
    <%_ if (hasTS) { _%>
    path.join(__dirname, '/tests/e2e/**/*.spec.ts'),
    <%_ } _%>
    path.join(__dirname, '/tests/e2e/**/*.spec.js')
  ],
  // Patterns to exclude.
  exclude: [
      // 'test/spec/multibrowser/**',
      // 'test/spec/mobile/**'
  ],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'trace',
  //
  // Set directory to store all logs into
  outputDir: path.join(__dirname, 'tests/e2e/logs'),
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 1000,
  //
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework
  // installed before running any tests.
  framework: 'mocha',
  //
  // The number of times to retry the entire specfile when it fails as a whole
  specFileRetries: 1,
  //
  // Retried specfiles are inserted at the beginning of the queue and retried immediately
  specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter.html
  reporters: ['spec'],
  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
    <%_ if (hasTS) { _%>
    require: 'ts-node/register',
    <%_ } _%>
  },
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  //
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function (config, capabilities) {
  },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  onWorkerStart: function (cid, caps, specs, args, execArgv) {
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: function (config, capabilities, specs) {
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: function (capabilities, specs) {
  },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  beforeSuite: function (suite) {
  },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   * stepData and world are Cucumber framework specific
   */
  beforeHook: function (test, context/*, stepData, world*/) {
  },
  /**
   * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
   * afterEach in Mocha)
   * stepData and world are Cucumber framework specific
   */
  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
  },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  beforeTest: function (test, context) {
  },
  //
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName command name
   * @param {Array} args arguments that command would receive
   */
  beforeCommand: function (commandName, args) {
  },
  /**
   * Runs after a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: function (commandName, args, result, error) {
  },
  /**
   * Function to be executed after a test (in Mocha/Jasmine) ends.
   */
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
  },
  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  afterSuite: function (suite) {
  },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  afterSession: function (config, capabilities, specs) {
  },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  onComplete: function (exitCode, config, capabilities, results) {
  },
  /**
  * Gets executed when a refresh happens.
  * @param {String} oldSessionId session ID of the old session
  * @param {String} newSessionId session ID of the new session
  */
  onReload: function(oldSessionId, newSessionId) {
  },
  //
  // Cucumber specific hooks
  beforeFeature: function (uri, feature, scenarios) {
  },
  beforeScenario: function (uri, feature, scenario, sourceLocation) {
  },
  beforeStep: function ({ uri, feature, step }, context) {
  },
  afterStep: function ({ uri, feature, step }, context, { error, result, duration, passed, retries }) {
  },
  afterScenario: function (uri, feature, scenario, result, sourceLocation) {
  },
  afterFeature: function (uri, feature, scenarios) {
  }
}
