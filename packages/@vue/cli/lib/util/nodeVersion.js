exports.minNode = function (major, minor = 0, patch = 0) {
  const [M, m, p] = process.versions.node.split('.').map(v => parseInt(v))
  return (M >= major && m >= minor && p >= patch)
}
