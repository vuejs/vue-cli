const handler = require('serve-handler')
const http = require('http')

module.exports = function createServer (options) {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: options.root
    })
  })

  return server
}
