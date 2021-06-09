// Autogenerated by Nightwatch
// Refer to the online docs for more details: https://nightwatchjs.org/gettingstarted/configuration/
const path = require('path')
const deepmerge = require('deepmerge')

const Services = {}
loadServices()
const VUE_DEV_SERVER_URL = process.env.VUE_DEV_SERVER_URL
const BROWSERSTACK_USER = process.env.BROWSERSTACK_USER
const BROWSERSTACK_KEY = process.env.VUE_DEV_SERVER_URL
const userOptions = JSON.parse(process.env.VUE_NIGHTWATCH_USER_OPTIONS || '{}')
const concurrentMode = process.env.VUE_NIGHTWATCH_CONCURRENT === '1'
const useSelenium = process.env.VUE_NIGHTWATCH_USE_SELENIUM === '1'
const startHeadless = process.env.VUE_NIGHTWATCH_HEADLESS === '1'
const chromeArgs = []
const geckoArgs = []

if (startHeadless) {
  chromeArgs.push('headless')
  geckoArgs.push('--headless')
}

const defaultSettings = {
  // An array of folders (excluding subfolders) where your tests are located;
  // if this is not specified, the test source must be passed as the second argument to the test runner.
  src_folders: ['tests/e2e/specs'],

  // See https://nightwatchjs.org/guide/working-with-page-objects/
  page_objects_path: 'tests/e2e/page-objects',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
  custom_commands_path: 'tests/e2e/custom-commands',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions
  custom_assertions_path: 'tests/e2e/custom-assertions',

  // See https://nightwatchjs.org/guide/#external-globals
  globals_path: path.resolve('tests/e2e/globals.js'),

  output_folder: 'tests/e2e/reports',

  webdriver: {},

  test_workers: {
    enabled: concurrentMode,
    workers: 'auto'
  },

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: `${VUE_DEV_SERVER_URL}`,

      screenshots: {
        enabled: false,
        path: 'screens',
        on_failure: true
      },

      desiredCapabilities: {
        browserName: 'firefox'
      },

      webdriver: {
        start_process: true,
        server_path: Services.geckodriver ? Services.geckodriver.path : ''
      }
    },

    safari: {
      desiredCapabilities: {
        browserName: 'safari',
        alwaysMatch: {
          acceptInsecureCerts: false
        }
      },
      webdriver: {
        port: 4445,
        start_process: true,
        server_path: '/usr/bin/safaridriver'
      }
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          // Enable this if you encounter unexpected SSL certificate errors in Firefox
          // acceptInsecureCerts: true,
          'moz:firefoxOptions': {
            args: geckoArgs
          }
        }
      },
      webdriver: {
        start_process: true,
        port: 4444,
        server_path: Services.geckodriver ? Services.geckodriver.path : '',
        cli_args: [
          // very verbose geckodriver logs
          // '-vv'
        ]
      }
    },

    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          // This tells Chromedriver to run using the legacy JSONWire protocol (not required in Chrome 78)
          // w3c: false,
          // More info on Chromedriver: https://sites.google.com/a/chromium.org/chromedriver/
          args: chromeArgs
        }
      },

      webdriver: {
        start_process: true,
        port: 9515,
        server_path: Services.chromedriver ? Services.chromedriver.path : '',
        cli_args: [
          // --verbose
        ]
      }
    },

    /// ///////////////////////////////////////////////////////////////////////////////
    // Configuration for when using the browserstack.com cloud service               |
    //                                                                               |
    // Please set the username and access key by setting the environment variables:  |
    // - BROWSERSTACK_USER                                                           |
    // - BROWSERSTACK_KEY                                                            |
    // .env files are supported                                                      |
    /// ///////////////////////////////////////////////////////////////////////////////
    browserstack: {
      selenium: {
        host: 'hub-cloud.browserstack.com',
        port: 443
      },
      // More info on configuring capabilities can be found on:
      // https://www.browserstack.com/automate/capabilities?tag=selenium-4
      desiredCapabilities: {
        'bstack:options': {
          local: 'false',
          userName: `${BROWSERSTACK_USER}`,
          accessKey: `${BROWSERSTACK_KEY}`
        }
      },

      disable_error_log: true,
      webdriver: {
        keep_alive: true,
        start_process: false
      }
    },

    'browserstack.chrome': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          // This tells Chromedriver to run using the legacy JSONWire protocol
          // More info on Chromedriver: https://sites.google.com/a/chromium.org/chromedriver/
          w3c: false
        }
      }
    },

    'browserstack.firefox': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'firefox'
      }
    },

    'browserstack.ie': {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'IE',
        browserVersion: '11.0',
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          local: 'false',
          seleniumVersion: '3.5.2',
          resolution: '1366x768'
        }
      }
    },

    /// ///////////////////////////////////////////////////////////////////////////////
    // Configuration for when using the Selenium service, either locally or remote,  |
    //  like Selenium Grid                                                           |
    /// ///////////////////////////////////////////////////////////////////////////////
    selenium: {
      // Selenium Server is running locally and is managed by Nightwatch
      selenium: {
        start_process: true,
        port: 4444,
        server_path: Services.seleniumServer
          ? Services.seleniumServer.path
          : '',
        cli_args: {
          'webdriver.gecko.driver': Services.geckodriver
            ? Services.geckodriver.path
            : '',
          'webdriver.chrome.driver': Services.chromedriver
            ? Services.chromedriver.path
            : ''
        }
      }
    },

    'selenium.chrome': {
      extends: 'selenium',
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          w3c: false
        }
      }
    },

    'selenium.firefox': {
      extends: 'selenium',
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          args: geckoArgs
        }
      }
    }
  }
}

const baseSettings = deepmerge(defaultSettings, webdriverServerSettings())

module.exports = deepmerge(baseSettings, adaptUserSettings(userOptions))

function adaptUserSettings (settings) {
  // The path to nightwatch external globals file needs to be made absolute
  // if it is supplied in an additional config file, due to merging of config files
  if (settings.globals_path) {
    settings.globals_path = path.resolve(settings.globals_path)
  }

  return settings
}

function webdriverServerSettings () {
  if (useSelenium) {
    return {
      selenium: {
        start_process: true,
        host: '127.0.0.1',
        port: 4444,
        server_path: require('selenium-server').path,
        cli_args: {
          'webdriver.chrome.driver': Services.chromedriver.path,
          'webdriver.gecko.driver': Services.geckodriver.path
        }
      }
    }
  }

  return {
    webdriver: {
      start_process: true,
      port: 9515,
      server_path: Services.chromedriver.path
    }
  }
}

function loadServices () {
  try {
    Services.seleniumServer = require('selenium-server')
  } catch (err) {}

  try {
    Services.chromedriver = require('chromedriver')
  } catch (err) {}

  try {
    Services.geckodriver = require('geckodriver')
  } catch (err) {}
}
