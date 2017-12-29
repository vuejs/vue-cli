// make sure generators are using the latest version of libs

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const globby = require('globby')
const { execSync } = require('child_process')

const npmPackageRE = /'(vue|vue-template-compiler|vuex|vue-router|vue-test-utils)': '\^(\d+\.\d+\.\d+)'/g

;(async () => {
  const paths = await globby(['packages/@vue/**/*.js'])
  paths
    .filter(p => !/\/files\//.test(p))
    .forEach(filePath => {
      let isUpdated = false
      const makeReplacer = versionGetter => (_, pkg, curVersion) => {
        const version = versionGetter(pkg)
        if (version !== curVersion) {
          isUpdated = true
          console.log(
            `${chalk.cyan(pkg)}: ${curVersion} => ${version} ` +
            chalk.gray(`(${path.relative(process.cwd(), filePath)})`)
          )
        }
        return `'${pkg}': '^${version}'`
      }

      const npmReplacer = makeReplacer(
        pkg => execSync(`npm view ${pkg} version`).toString().trim()
      )

      const updated = fs.readFileSync(filePath, 'utf-8')
        .replace(npmPackageRE, npmReplacer)

      if (isUpdated) {
        fs.writeFileSync(filePath, updated)
      }
    })
})()
