const fs = require('fs')
const path = require('path')

const camelizeRE = /-(\w)/g
const camelize = str => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

const hyphenateRE = /\B([A-Z])/g
const hyphenate = str => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
}

exports.filesToComponentNames = (prefix, files) => {
  return files.map(file => {
    const basename = path.basename(file).replace(/\.(jsx?|vue)$/, '')
    const camelName = camelize(basename)
    const kebabName = `${prefix}-${hyphenate(basename)}`
    return {
      file,
      basename,
      camelName,
      kebabName
    }
  })
}

exports.generateMultiWebComponentEntry = (prefix, files) => {
  const filePath = path.resolve(__dirname, 'entry-multi-wc.js')
  const content = `
import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'

${exports.filesToComponentNames(prefix, files).map(({ file, camelName, kebabName }) => {
    return (
      `import ${camelName} from '~root/${file}'\n` +
    `window.customElements.define('${kebabName}', wrap(Vue, ${camelName}))\n`
    )
  }).join('\n')}`.trim()
  fs.writeFileSync(filePath, content)
  return filePath
}
