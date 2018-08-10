// create package.json and README for packages that don't have one yet

const fs = require('fs')
const path = require('path')
const baseVersion = require('../packages/@vue/cli-service/package.json').version

const packagesDir = path.resolve(__dirname, '../packages/@vue')
const files = fs.readdirSync(packagesDir)

files.forEach(pkg => {
  if (pkg.charAt(0) === '.') return

  const isPlugin = /^cli-plugin-/.test(pkg)
  const desc = isPlugin
    ? `${pkg.replace('cli-plugin-', '')} plugin for vue-cli`
    : `${pkg.replace('cli-', '')} for vue-cli`

  const pkgPath = path.join(packagesDir, pkg, `package.json`)
  if (!fs.existsSync(pkgPath)) {
    const json = {
      'name': `@vue/${pkg}`,
      'version': baseVersion,
      'description': desc,
      'main': 'index.js',
      'publishConfig': {
        'access': 'public'
      },
      'repository': {
        'type': 'git',
        'url': 'git+https://github.com/vuejs/vue-cli.git'
      },
      'keywords': [
        'vue',
        'cli'
      ],
      'author': 'Evan You',
      'license': 'MIT',
      'bugs': {
        'url': 'https://github.com/vuejs/vue-cli/issues'
      },
      'homepage': `https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/${pkg}#readme`
    }
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2))
  }

  const readmePath = path.join(packagesDir, pkg, `README.md`)
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# @vue/${pkg}\n\n> ${desc}`)
  }

  const npmIgnorePath = path.join(packagesDir, pkg, `.npmignore`)
  if (!fs.existsSync(npmIgnorePath)) {
    fs.writeFileSync(npmIgnorePath, `__tests__\n__mocks__`)
  }
})
