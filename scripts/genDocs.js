const fs = require('fs')
const path = require('path')

const pluginsDirPath = path.resolve(__dirname, '../packages', '@vue')
const pluginRegEx = new RegExp('cli-plugin-')

function generatePluginDoc (plugin) {
  const entryPath = path.resolve(__dirname, '../packages', '@vue', plugin, 'README.md')
  const entryContent = fs.readFileSync(entryPath)
  const docPath = path.resolve(__dirname, '../docs', 'core-plugins', `${plugin.replace('cli-plugin-', '')}.md`)
  fs.writeFile(docPath, entryContent, () => { })
}

const genDocs = (module.exports = async () => {
  fs.readdir(pluginsDirPath, (_, files) => {
    files.forEach(file => {
      if (pluginRegEx.test(file)) {
        generatePluginDoc(file)
      }
    })
  })
})

genDocs().catch(err => {
  console.error(err)
  process.exit(1)
})
