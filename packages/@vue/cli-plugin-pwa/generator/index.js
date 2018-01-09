module.exports = api => {
  api.render('./template')

  api.postProcessFiles(files => {
    const main = files['src/main.js']
    if (main) {
      // inject import for registerServiceWorker script into main.js
      const lines = main.split('\n').reverse()
      const lastImportIndex = lines.findIndex(line => line.match(/^import/))
      lines[lastImportIndex] += `\nimport './registerServiceWorker'`
      files['src/main.js'] = lines.reverse().join('\n') + '\n'
    }
  })
}
