const path = require('path')
const express = require('express')
const fallback = require('express-history-api-fallback')
// Connectors
const clientAddons = require('./connectors/client-addons')
const plugins = require('./connectors/plugins')

const distPath = path.resolve(__dirname, '../dist')
const publicPath = path.resolve(__dirname, '../ui-public')

module.exports = app => {
  app.use(express.static(distPath, { maxAge: 0 }))
  app.use('/public', express.static(publicPath, { maxAge: 0 }))
  app.use('/_plugin/:id/*', plugins.serve)
  app.use('/_plugin-logo/:id', plugins.serveLogo)
  app.use('/_addon/:id/*', clientAddons.serve)
  app.use(fallback(path.join(distPath, 'index.html'), { maxAge: 0 }))
}
