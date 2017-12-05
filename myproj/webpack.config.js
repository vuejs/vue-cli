'use strict'

const path = require('path')
const webpack = require('webpack')
//const utils = require('./build/utils')
//const config = require('./config')
//const vueLoaderConfig = require('./build/vue-loader.conf')

const configExport = {
  entry: path.resolve(__dirname, './src/main'),
  resolve: { extensions: ['.js', '.vue'] },
  output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.min.js' },
  module: {
    rules: [
      { 
        enforce: 'pre', 
        test: /\.vue$/, 
        loader: 'eslint-loader', 
        exclude: /node_modules/
      },
      { 
        enforce: 'pre', 
        test: /\.js$/, 
        loader: 'eslint-loader', 
        exclude: /node_modules/
      },
      { 
        test: /\.vue$/, 
        loader: 'vue-loader', 
        exclude: /node_modules/
      },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader'
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader'
      }
    ]
  }
}

if (process.env.NODE_ENV === 'production') {
  configExport.plugins = [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    // scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // uglify: unused needs to be set to false or else library will not work properly
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false, unused: false },
      output: { comments: false }
    })
  ]
} else {
  configExport.devtool = 'eval'
  configExport.plugins = [new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') })]
}

module.exports = configExport
