const textsForScripts = {
  build: {
    command: 'run build',
    description: 'Build for production'
  },
  serve: {
    command: 'run serve',
    description: 'Start local server with hot reload'
  },
  test: {
    command: 'run test',
    description: 'Start local server with hot reload'
  }
}

function getScripts (pkg, packageManager) {
  return Object.keys(pkg.scripts).map(key => {
    const text = textsForScripts[key]

    if (text) {
      return `
### ${text.description}
${packageManager} ${text.command}
`
    }
  }).join('')
}

module.exports = function generateReadme (pkg, packageManager) {
  return `# ${pkg.name}

## Build setup
${packageManager} install
${getScripts(pkg, packageManager)}`
}
