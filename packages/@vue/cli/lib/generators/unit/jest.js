module.exports = (api, options) => {
  api.extendPackage({
    scripts: {
      test: 'jest'
    },
    devDependencies: {
      '@vue/cli-plugin-unit-jest': '^1.0.0',
      "jest": "^22.0.4",
      'vue-test-utils': '^1.0.0'
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
        "json",
        // tell Jest to handle *.vue files
        "vue"
      ],
      "transform": {
        // process js with babel-jest
        "^.+\\.js$": "<rootDir>/node_modules/@vue/cli-plugin-unit-jest/node_modules/babel-jest",
        // process *.vue files with vue-jest
        ".*\\.(vue)$": "<rootDir>/node_modules/@vue/cli-plugin-unit-jest/node_modules/vue-jest"
      },
      // support the same @ -> src alias mapping in source code
      "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
      },
      // serializer for snapshots
      "snapshotSerializers": [
        "<rootDir>/node_modules/@vue/cli-plugin-unit-jest/node_modules/jest-serializer-vue"
      ],
      "mapCoverage": true
    }
  })

  api.injectFileMiddleware(files => {
    // add dummy test
    files['test/unit/Hello.spec.js'] = api.renderFile('Hello.spec.js')
  })
}
