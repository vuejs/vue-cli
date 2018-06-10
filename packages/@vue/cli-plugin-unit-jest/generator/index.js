module.exports = api => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      '@vue/test-utils': '^1.0.0-beta.16'
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
      '^.+\\.vue$': 'vue-jest',
      '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
    },
    // support the same @ -> src alias mapping in source code
    'moduleNameMapper': {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    // serializer for snapshots
    'snapshotSerializers': [
      'jest-serializer-vue'
    ],
    'testMatch': [
      '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))'
    ]
  }

  if (!api.hasPlugin('typescript')) {
    jestConfig.transform['^.+\\.jsx?$'] = 'babel-jest'
    if (api.hasPlugin('babel')) {
      api.extendPackage({
        devDependencies: {
          'babel-jest': '^23.0.1',
          // this is for now necessary to force babel-jest and vue-jest to use babel 7
          'babel-core': '7.0.0-bridge.0'
        }
      })
    } else {
      api.extendPackage({
        babel: {
          plugins: ['transform-es2015-modules-commonjs']
        }
      })
    }
  } else {
    jestConfig.moduleFileExtensions.unshift('ts', 'tsx')
    jestConfig.transform['^.+\\.tsx?$'] = 'ts-jest'
    api.extendPackage({
      devDependencies: {
        'ts-jest': '^22.4.6'
      }
    })
    if (api.hasPlugin('babel')) {
      api.extendPackage({
        devDependencies: {
          // this is for now necessary to force ts-jest and vue-jest to use babel 7
          'babel-core': '7.0.0-bridge.0'
        }
      })
    }
  }

  api.extendPackage({ jest: jestConfig })

  if (api.hasPlugin('eslint')) {
    api.render(files => {
      files['tests/unit/.eslintrc.js'] = api.genJSConfig({
        env: { jest: true },
        rules: {
          'import/no-extraneous-dependencies': 'off'
        }
      })
    })
  }
}
