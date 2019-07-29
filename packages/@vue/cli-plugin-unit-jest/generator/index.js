module.exports = (api, _, __, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      'test:unit': 'vue-cli-service test:unit'
    },
    devDependencies: {
      '@vue/test-utils': '1.0.0-beta.29'
    },
    jest: {
      moduleFileExtensions: [
        'js',
        'jsx',
        'json',
        // tell Jest to handle *.vue files
        'vue'
      ],
      transform: {
        // process *.vue files with vue-jest
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
          'jest-transform-stub'
      },
      'transformIgnorePatterns': ['/node_modules/'],
      // support the same @ -> src alias mapping in source code
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      // serializer for snapshots
      snapshotSerializers: ['jest-serializer-vue'],
      testMatch: [
        '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
      ],
      // https://github.com/facebook/jest/issues/6766
      testURL: 'http://localhost/',
      watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
      ]
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
          'babel-jest': '^24.8.0',
          '@babel/core': '^7.4.5'
        }
      })
    } else {
      // ts-jest still does not support babel.config.js
      // https://github.com/kulshekhar/ts-jest/issues/933
      api.render(files => {
        files['.babelrc'] = JSON.stringify(
          {
            plugins: ['@babel/plugin-transform-modules-commonjs']
          },
          null,
          2
        )
      })
    }
  } else {
    applyTS(api, invoking)
  }

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }
}

const applyTS = (module.exports.applyTS = (api, invoking) => {
  api.extendPackage({
    jest: {
      moduleFileExtensions: ['ts', 'tsx'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      }
    },
    devDependencies: {
      '@types/jest': '^24.0.11',
      'ts-jest': '^24.0.2'
    }
  })
  if (api.hasPlugin('babel')) {
    api.extendPackage({
      jest: {
        globals: {
          'ts-jest': {
            // we need babel to transpile JSX
            babelConfig: true
          }
        }
      },
      devDependencies: {
        // this is for now necessary to force ts-jest and vue-jest to use babel 7
        '@babel/core': '^7.4.5',
        'babel-core': '7.0.0-bridge.0'
      }
    })
  }
  // inject jest type to tsconfig.json
  if (invoking) {
    api.render(files => {
      const tsconfig = files['tsconfig.json']
      if (tsconfig) {
        const parsed = JSON.parse(tsconfig)
        if (
          parsed.compilerOptions.types &&
          !parsed.compilerOptions.types.includes('jest')
        ) {
          parsed.compilerOptions.types.push('jest')
        }
        files['tsconfig.json'] = JSON.stringify(parsed, null, 2)
      }
    })
  }
})

const applyESLint = (module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { jest: true }
    })
  })
})
