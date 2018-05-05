const jsonServer = require('json-server')

const defaultData = () => ({
  'posts': [
    { 'id': 1, 'title': 'json-server', 'author': 'typicode' }
  ],
  'comments': [
    { 'id': 1, 'body': 'some comment', 'postId': 1 }
  ],
  'profile': { 'name': 'typicode' }
})

module.exports = function createJSONServer (data = defaultData()) {
  const server = jsonServer.create()
  const router = jsonServer.router(data)
  const middlewares = jsonServer.defaults()

  server.use(middlewares)
  server.use(router)
  return server
}
