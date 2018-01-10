// make sure generators are using the latest version of plugins,
// and plugins are using the latest version of deps

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const semver = require('semver')
const globby = require('globby')
const { execSync } = require('child_process')
const inquirer = require('inquirer')

const localPackageRE = /'(@vue\/[\w-]+)': '\^(\d+\.\d+\.\d+)'/g

// these are packages that may be injected by extendPackage
// in a generator, so they only exist in js, not package.json
const packagesToCheck = [
  'vue',
  'vue-template-compiler',
  'vuex',
  'vue-router',
  '@vue/test-utils',
  'eslint-plugin-vue',
  'autoprefixer',
  'node-sass',
  'sass-loader',
  'less',
  'less-loader',
  'stylus',
  'stylus-loader'
]
const npmPackageRE = new RegExp(`'(${packagesToCheck.join('|')})': '\\^(\\d+\\.\\d+\\.\\d+[^']*)'`)

const versionCache = {}
const getRemoteVersion = pkg => {
  if (versionCache[pkg]) {
    return versionCache[pkg]
  }
  const version = execSync(`npm view ${pkg} version`).toString().trim()
  versionCache[pkg] = version
  return version
}

const checkUpdate = (pkg, filePath, local, remote) => {
  if (remote !== local) {
    const isCompat = semver.intersects(`^${local}`, `^${remote}`)
    console.log(
      `${chalk.cyan(pkg)}: ${local} => ${remote} ` +
      (isCompat ? `` : chalk.red.bold(`maybe breaking `)) +
      chalk.gray(`(${path.relative(process.cwd(), filePath)})`)
    )
    return true
  }
}

const writeCache = {}
const bufferWrite = (file, content) => {
  writeCache[file] = content
}
const flushWrite = () => {
  for (const file in writeCache) {
    fs.writeFileSync(file, writeCache[file])
  }
}

;(async () => {
  const paths = await globby(['packages/@vue/**/*.js'])
  paths
    .filter(p => !/\/files\//.test(p))
    .forEach(filePath => {
      let isUpdated = false
      const makeReplacer = versionGetter => (_, pkg, curVersion) => {
        const version = versionGetter(pkg)
        if (!version) return _
        if (checkUpdate(pkg, filePath, curVersion, version)) {
          isUpdated = true
        }
        return `'${pkg}': '^${version}'`
      }

      const localReplacer = makeReplacer(
        pkg => {
          try {
            return require(`../packages/${pkg}/package.json`).version
          } catch (e) {}
        }
      )

      const npmReplacer = makeReplacer(getRemoteVersion)

      const updated = fs.readFileSync(filePath, 'utf-8')
        // update @vue packages in this repo
        .replace(localPackageRE, localReplacer)
        // also update vue, vue-template-compiler, vuex, vue-router
        .replace(npmPackageRE, npmReplacer)

      if (isUpdated) {
        bufferWrite(filePath, updated)
      }
    })

    // update all package deps
  const packages = await globby(['packages/@vue/*/package.json'])
  await Promise.all(packages.filter(filePath => {
    return filePath.match(/cli-service|cli-plugin|babel-preset|eslint-config/)
  }).map(async (filePath) => {
    const pkg = require(path.resolve(__dirname, '../', filePath))
    if (!pkg.dependencies) {
      return
    }
    let isUpdated = false
    const deps = pkg.dependencies
    for (const dep in deps) {
      if (dep.match(/^@vue/)) continue
      let local = deps[dep]
      if (local.charAt(0) !== '^') continue
      local = local.replace(/^\^/, '')
      const remote = (await execa('npm', ['view', dep, 'version'])).stdout
      if (checkUpdate(dep, filePath, local, remote)) {
        deps[dep] = `^${remote}`
        isUpdated = true
      }
    }
    if (isUpdated) {
      bufferWrite(filePath, JSON.stringify(pkg, null, 2) + '\n')
    }
  }))

  const { yes } = await inquirer.prompt([{
    name: 'yes',
    type: 'confirm',
    message: 'Commit above updates?'
  }])

  if (yes) {
    flushWrite()
  }
})()
