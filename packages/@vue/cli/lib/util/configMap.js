const stringifyJS = require('javascript-stringify')
const json = value => JSON.stringify(value, null, 2)
const js = value => `module.exports = ${stringifyJS(value, null, 2)}`

module.exports = {
  vue: {
    filename: 'vue.config.js',
    transform: js
  },
  babel: {
    filename: '.babelrc',
    transform: json
  },
  postcss: {
    filename: '.postcssrc',
    transform: json
  },
  eslintConfig: {
    filename: '.eslintrc',
    transform: json
  },
  jest: {
    filename: 'jest.config.js',
    transform: js
  },
  browserslist: {
    filename: '.browserslistrc',
    transform: value => value.join('\n')
  }
  // 'lint-staged': {
  //   filename: '.lintstagedrc',
  //   transform: json
  // }
}
