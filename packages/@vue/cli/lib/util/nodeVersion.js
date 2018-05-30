exports.minNode = function (major, minor = 0, patch = 0) {
  const parts = process.versions.node.split('.').map(v => parseInt(v))
  if (parts[0] >= major && parts[1] >= minor && parts[2] >= patch) return true
  return false
}
