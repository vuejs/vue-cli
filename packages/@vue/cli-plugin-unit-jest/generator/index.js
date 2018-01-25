module.exports = api => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      test: 'vue-cli-service test'
    },
    devDependencies: {
      '@vue/test-utils': '^1.0.0-beta.10'
    }
  })

  const jestConfig = {
    'moduleFileExtensions': [
      'js',
      'jsx',
      'json',
      // tell Jest to handle *.vue files
      'vue'
    ],
    'transform': {
      // process *.vue files with vue-jest
      '^.+\\.vue$': 'vue-jest'
    },
    // support the same @ -> src alias mapping in source code
    'moduleNameMapper': {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    // serializer for snapshots
    'snapshotSerializers': [
      'jest-serializer-vue'
    ],
    'mapCoverage': true
  }

  if (!api.hasPlugin('typescript')) {
    jestConfig.transform['^.+\\.jsx?$'] = 'babel-jest'
    api.extendPackage({
      devDependencies: {
        'babel-jest': '^22.0.4',
        // this is for now necessary to force babel-jest and vue-jest to use babel 7
        'babel-core': '^7.0.0-0'
      }
    })
  } else {
    jestConfig.moduleFileExtensions.unshift('ts', 'tsx')
    jestConfig.transform['^.+\\.tsx?$'] = 'ts-jest'
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^22.0.1'
      }
    })
    if (api.hasPlugin('babel')) {
      api.extendPackage({
        devDependencies: {
          // this is for now necessary to force ts-jest and vue-jest to use babel 7
          'babel-core': '^7.0.0-0'
        }
      })
    }
  }

  api.extendPackage({ jest: jestConfig })

  if (api.hasPlugin('eslint')) {
    api.render(files => {
      files['test/unit/.eslintrc'] = JSON.stringify({
        env: { jest: true }
      }, null, 2)
    })
  }
}
