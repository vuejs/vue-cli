// dev only

const fs = require('fs')
const path = require('path')

module.exports = function updatePackageForDev (targetDir, deps) {
  const pkg = require(path.resolve(targetDir, 'package.json'))
  pkg.devDependencies = {}
  deps.forEach(dep => {
    pkg.devDependencies[dep] = require(path.resolve(
      __dirname,
      '../../../',
      dep,
      'package.json'
    )).version
  })
  fs.writeFileSync(
    path.resolve(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2)
  )
}
