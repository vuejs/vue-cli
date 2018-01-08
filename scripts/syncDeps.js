// make sure generators are using the latest version of plugins

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const globby = require('globby')
const { execSync } = require('child_process')

const localPackageRE = /'(@vue\/[\w-]+)': '\^(\d+\.\d+\.\d+)'/g

const packagesToCheck = [
  'vue',
  'vue-template-compiler',
  'vuex',
  'vue-router',
  'vue-test-utils',
  'eslint-plugin-vue',
  'node-sass',
  'sass-loader',
  'less',
  'less-loader',
  'stylus',
  'stylus-loader'
]
const npmPackageRE = new RegExp(`'(${packagesToCheck.join('|')})': '\\^(\\d+\\.\\d+\\.\\d+[^']*)'`)

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

      if (isUpdated) {
        fs.writeFileSync(filePath, updated)
      }
    })
})()
