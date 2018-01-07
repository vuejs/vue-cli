const path = require('path')
const { findExisting } = require('./util')

module.exports = function createConfigPlugin (context, entry) {
  return {
    id: '@vue/cli-service-global-config',
    apply: api => {
      api.chainWebpack(config => {
        // entry is *.vue file, create alias for built-in js entry
        if (/\.vue$/.test(entry)) {
          config.resolve
            .alias
              .set('~entry', path.resolve(context, entry))
          entry = require.resolve('../template/main.js')
        } else {
          // make sure entry is relative
          if (!/^\.\//.test(entry)) {
            entry = `./${entry}`
          }
        }

        // include resolve
        config.resolve
          .modules
            .add(path.resolve(__dirname, '../node_modules'))

        // set entry
        config
          .entry('app')
            .clear()
            .add(entry)

        const babelOptions = {
          presets: [require.resolve('@vue/babel-preset-app')]
        }

        // set inline vue-loader options
        config.module
          .rule('vue')
            .use('vue-loader')
              .tap(options => {
                return Object.assign({
                  loaders: {
                    js: {
                      loader: 'babel-loader',
                      options: babelOptions
                    }
                  }
                }, options)
              })

        // set inline babel options
        config.module
          .rule('js')
            .include
              .clear()
              .end()
            .exclude
              .add(/node_modules/)
              .end()
            .use('babel-loader')
              .tap(() => babelOptions)

        // set inline eslint options
        const ESLintConfigFile = findExisting(context, [
          '.eslintrc.js',
          '.eslintrc.yaml',
          '.eslintrc.yml',
          '.eslintrc.json',
          '.eslintrc',
          'package.json'
        ])
        const hasESLintConfig = ESLintConfigFile === 'package.json'
          ? !!(require(path.join(context, 'package.json')).eslintConfig)
          : !!ESLintConfigFile
        config.module
          .rule('eslint')
            .include
              .clear()
              .end()
            .exclude
              .add(/node_modules/)
              .end()
            .use('eslint-loader')
              .tap(options => Object.assign({}, options, {
                useEslintrc: hasESLintConfig,
                baseConfig: {
                  extends: [
                    'plugin:vue/essential',
                    'eslint:recommended'
                  ]
                }
              }))

        // set html plugin template
        const indexFile = findExisting(context, [
          'index.html',
          'public/index.html'
        ]) || path.resolve(__dirname, '../template/index.html')
        config
          .plugin('html')
            .tap(() => [{ template: indexFile }])
      })
    }
  }
}
