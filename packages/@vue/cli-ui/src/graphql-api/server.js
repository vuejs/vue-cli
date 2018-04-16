const path = require('path')
const express = require('express')
const fallback = require('express-history-api-fallback')

const clientAddons = require('./connectors/client-addons')

const distPath = path.resolve(__dirname, '../../dist')

module.exports = app => {
  app.use(express.static(distPath))
  app.use('/_addon/:id/*', clientAddons.serve)
  app.use(fallback(path.join(distPath, 'index.html')))
}
