const launchEditor = require('./launchEditor')

module.exports = () => {
  return function launchEditorMiddleware (req, res, next) {
    if (req.url.startsWith('/open-in-editor')) {
      launchEditor(req.query.fileName, req.query.lineNumber)
      res.end()
    } else {
      next()
    }
  }
}
