module.exports = api => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      '@vue/test-utils': '^1.0.0-beta.20'
    },
    jest: {
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
        '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
      ],
      // https://github.com/facebook/jest/issues/6766
      'testURL': 'http://localhost/'
    }
  })

  if (!api.hasPlugin('typescript')) {
    api.extendPackage({
      jest: {
        transform: {
          '^.+\\.jsx?$': 'babel-jest'
        }
      }
    })
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
    applyTS(api)
  }

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }
}

const applyTS = module.exports.applyTS = api => {
  // TODO inject type into tsconfig.json
  api.extendPackage({
    jest: {
      moduleFileExtensions: ['ts', 'tsx'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      }
    },
    devDependencies: {
      '@types/jest': '^23.1.4',
      'ts-jest': '^23.0.0'
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

const applyESLint = module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { jest: true },
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    })
  })
}
