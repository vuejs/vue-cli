const fs = require('fs')
const path = require('path')
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
    throw new Error(`Cannot infer entry file in ${context}. Please specify an entry.`)
  }

  if (!fs.existsSync(path.join(context, entry))) {
    throw new Error(`Entry file ${entry} does not exist.`)
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
