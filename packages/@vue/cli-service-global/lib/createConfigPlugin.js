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

        // include resolve for deps of this module.
        // when installed globally, the location may vary depending on
        // package managers their folder structures for global install.
        // so we first resolve the location of vue and then trace to the
        // install location.
        const modulePath = path.resolve(require.resolve('vue'), '../../../')

        config.resolve
          .modules
            .add(modulePath)

        config.resolveLoader
          .modules
            .add(modulePath)

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
                options.loaders.js[1].options = babelOptions
                return options
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

        // disable copy plugin if no public dir
        if (!findExisting(context, ['public'])) {
          config.plugins.delete('copy')
        }
      })
    }
  }
}
