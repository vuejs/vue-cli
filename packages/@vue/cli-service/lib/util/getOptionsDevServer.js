module.exports = (options) => {
  if (typeof options.devServer === 'function') {
    options.devServer = options.devServer()
  }

  return options.devServer
}

