module.exports = (api, _, __, invoking) => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

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
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
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
      // Jest's shipped babel-jest still uses babel 6,
      // so we cannot use extendPackage which renders babel.config.js.
      api.render(files => {
        files['.babelrc'] = JSON.stringify({
          plugins: ['transform-es2015-modules-commonjs']
        }, null, 2)
      })
    }
  } else {
    applyTS(api, invoking)
  }

  if (api.hasPlugin('eslint')) {
    applyESLint(api)
  }
}

const applyTS = module.exports.applyTS = (api, invoking) => {
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
}

const applyESLint = module.exports.applyESLint = api => {
  api.render(files => {
    files['tests/unit/.eslintrc.js'] = api.genJSConfig({
      env: { jest: true }
    })
  })
}
