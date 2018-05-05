module.exports = api => {
  const options = {
    extensions: ['.js', '.vue'],
    envs: ['node'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }

  if (api.hasPlugin('typescript')) {
    options.extensions.push('.ts')
  } else {
    options.parserOptions = {
      parser: require.resolve('babel-eslint')
    }
  }

  return options
}
