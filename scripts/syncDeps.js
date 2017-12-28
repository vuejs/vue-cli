// make sure generators are using the latest version of plugins

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const globby = require('globby')
const { execSync } = require('child_process')

const localPackageRE = /'(@vue\/cli-[\w-]+)': '\^(\d+\.\d+\.\d+)'/g
const npmPackageRE = /'(vue|vue-template-compiler|vuex|vue-router|vue-test-utils)': '\^(\d+\.\d+\.\d+)'/g

;(async () => {
  const paths = await globby(['packages/@vue/cli/lib/generators/**/*.js'])
  paths
    .filter(p => !/\/files\//.test(p))
    .forEach(filePath => {
      const makeReplacer = versionGetter => (_, pkg, curVersion) => {
        const version = versionGetter(pkg)
        if (version !== curVersion) {
          console.log(
            `${chalk.cyan(pkg)}: ${curVersion} => ${version} ` +
            chalk.gray(`(${path.relative(process.cwd(), filePath)})`)
          )
        }
        return `'${pkg}': '^${version}'`
      }

      const localReplacer = makeReplacer(
        pkg => require(`../packages/${pkg}/package.json`).version
      )

      const npmReplacer = makeReplacer(
        pkg => execSync(`npm view ${pkg} version`).toString().trim()
      )

      const updated = fs.readFileSync(filePath, 'utf-8')
        // update @vue packages in this repo
        .replace(localPackageRE, localReplacer)
        // also update vue, vue-template-compiler, vuex, vue-router
        .replace(npmPackageRE, npmReplacer)

      fs.writeFileSync(filePath, updated)
    })
})()
