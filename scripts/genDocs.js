const fs = require('fs')
const path = require('path')

const plugins = ['babel', 'e2e-cypress', 'e2e-nightwatch', 'eslint', 'pwa', 'typescript', 'unit-jest', 'unit-mocha']

const genDocs = (module.exports = async () => {
  plugins.forEach(plugin => {
    const entryPath = path.resolve(__dirname, '../packages', '@vue', `cli-plugin-${plugin}`, 'README.md')
    const entryContent = fs.readFileSync(entryPath)
    const docPath = path.resolve(__dirname, '../docs', 'core-plugins', `${plugin}.md`)
    fs.writeFile(docPath, entryContent, () => {})
  })
})

genDocs().catch(err => {
  console.error(err)
  process.exit(1)
})
