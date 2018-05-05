module.exports = api => {
  api.extendPackage({
    dependencies: {
      'register-service-worker': '^1.0.0'
    }
  })

  api.render('./template')

  api.postProcessFiles(files => {
    const isTS = 'src/main.ts' in files
    const file = isTS
      ? 'src/main.ts'
      : 'src/main.js'
    const main = files[file]
    if (main) {
      // inject import for registerServiceWorker script into main.js
      const lines = main.split(/\r?\n/g).reverse()
      const lastImportIndex = lines.findIndex(line => line.match(/^import/))
      lines[lastImportIndex] += `\nimport './registerServiceWorker'`
      files[file] = lines.reverse().join('\n')
    }
  })
}
