const path = require('path')

const config = {
  entry: path.resolve(__dirname, 'src/index'),
  resolve: { extensions: ['.js'] },
  output: { path: path.resolve(__dirname, 'dist'), filename: 'keras.min.js', library: 'KerasJS', libraryTarget: 'umd' },
  module: {
    rules: [{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }]
  },
  node: {
    fs: 'empty'
  }
}

module.exports = config
