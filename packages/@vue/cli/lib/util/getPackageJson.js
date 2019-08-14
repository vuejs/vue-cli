const fs = require('fs')
const path = require('path')

module.exports = function getPackageJson (projectPath) {
  const packagePath = path.join(projectPath, 'package.json')

  let packageJson
  try {
    packageJson = fs.readFileSync(packagePath, 'utf-8')
  } catch (err) {
    throw new Error(`${packagePath} not exist`)
  }

  try {
    packageJson = JSON.parse(packageJson)
  } catch (err) {
    throw new Error('The package.json is malformed')
  }

  return packageJson
}
