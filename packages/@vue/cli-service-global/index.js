const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const Service = require('@vue/cli-service')
const { toPlugin, findExisting } = require('./lib/util')

const babelPlugin = toPlugin('@vue/cli-plugin-babel')
const eslintPlugin = toPlugin('@vue/cli-plugin-eslint')
const createConfigPlugin = require('./lib/createConfigPlugin')

function createService (entry) {
  const context = process.cwd()

  entry = entry || findExisting(context, [
    'main.js',
    'index.js',
    'App.vue',
    'app.vue'
  ])

  if (!entry) {
    console.log(chalk.red(`Failed to locate entry file in ${chalk.yellow(context)}.`))
    console.log(chalk.red(`Valid entry file should be one of: main.js, index.js, App.vue or app.vue.`))
    process.exit(1)
  }

  if (!fs.existsSync(path.join(context, entry))) {
    console.log(chalk.red(`Entry file ${chalk.yellow(entry)} does not exist.`))
    process.exit(1)
  }

  return new Service(context, {
    projectOptions: {
      compiler: true,
      lintOnSave: true
    },
    plugins: [
      babelPlugin,
      eslintPlugin,
      createConfigPlugin(context, entry)
    ]
  })
}

exports.serve = (entry, args) => {
  createService(entry).run('serve', args)
}

exports.build = (entry, args) => {
  createService(entry).run('build', args)
}
