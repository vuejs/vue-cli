const path = require('path')
const express = require('express')
const fallback = require('express-history-api-fallback')
// Connectors
const clientAddons = require('./connectors/client-addons')
const plugins = require('./connectors/plugins')

const distPath = path.resolve(__dirname, '../dist')
const publicPath = path.resolve(__dirname, '../ui-public')

const CACHE_CONTROL = 'no-store, no-cache, must-revalidate, private'

module.exports = app => {
  app.use(express.static(distPath, { setHeaders }))
  app.use('/public', express.static(publicPath, { setHeaders }))
  app.use('/_plugin/:id/*', plugins.serve)
  app.use('/_plugin-logo/:id', plugins.serveLogo)
  app.use('/_addon/:id/*', clientAddons.serve)
  app.use(fallback(path.join(distPath, 'index.html'), {
    headers: {
      'Cache-Control': CACHE_CONTROL
    }
  }))
}

function setHeaders (res, path, stat) {
  res.set('Cache-Control', CACHE_CONTROL)
}
