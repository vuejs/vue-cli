const resolve = require('resolve')

exports.resolveModule = function resolveModule (request, context) {
  let resolvedPath
  try {
    resolvedPath = resolve.sync(request, { basedir: context })
  } catch (e) {}
  return resolvedPath
}

exports.loadModule = function loadModule (request, context) {
  const resolvedPath = exports.resolveModule(request, context)
  if (resolvedPath) {
    return require(resolvedPath)
  }
}
