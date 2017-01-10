var path = require('path')
var express = require('express')
var proxyMiddleware = require('http-proxy-middleware')

module.exports = function createServer (compiler, options) {
  var server = express()

  var devMiddleWare = require('webpack-dev-middleware')(compiler, {
    quiet: true
  })

  server.use(devMiddleWare)
  server.use(require('webpack-hot-middleware')(compiler, {
    log: () => null
  }))
  server.use(require('connect-history-api-fallback')({index: '/'}))

  var mfs = devMiddleWare.fileSystem
  var file = path.join(compiler.options.output.path, 'index.html')

  // proxy api requests
  if (typeof options.proxy === 'string') {
    server.use(proxyMiddleware('/api', {
      target: options.proxy,
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }))
  } else if (typeof options.proxy === 'object') {
    Object.keys(options.proxy).forEach(function (context) {
      var proxyOptions = options.proxy[context]
      if (typeof proxyOptions === 'string') {
        proxyOptions = {
          target: proxyOptions,
          changeOrigin: true,
          pathRewrite: {
            [`^${context}`]: ''
          }
        }
      }
      server.use(proxyMiddleware(context, proxyOptions))
    })
  }

  server.get('/', (req, res) => {
    devMiddleWare.waitUntilValid(() => {
      const html = mfs.readFileSync(file)
      res.end(html)
    })
  })

  if (options.setup) {
    options.setup(server)
  }

  return server
}
