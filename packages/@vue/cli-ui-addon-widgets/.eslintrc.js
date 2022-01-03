module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'warn'
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    babelOptions: {
      cwd: __dirname
    }
  },
  globals: {
    ClientAddonApi: false,
    mapSharedData: false,
    Vue: false,
    name: 'off'
  }
}
