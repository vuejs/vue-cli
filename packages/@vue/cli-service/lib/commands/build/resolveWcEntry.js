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

exports.fileToComponentName = (prefix, file) => {
  const basename = path.basename(file).replace(/\.(jsx?|vue)$/, '')
  const camelName = camelize(basename)
  const kebabName = `${prefix ? `${prefix}-` : ``}${hyphenate(basename)}`
  return {
    basename,
    camelName,
    kebabName
  }
}

exports.resolveEntry = (prefix, files, async) => {
  const filePath = path.resolve(__dirname, 'entry-wc.js')
  const content = `
import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'

// runtime shared by every component chunk
import 'css-loader/lib/css-base'
import 'vue-style-loader/lib/addStylesShadow'
import 'vue-loader/lib/runtime/component-normalizer'

;(() => {
  let i
  if ((i = document.currentScript) && (i = i.src.match(/(.+\\/)[^/]+\\.js$/))) {
    __webpack_public_path__ = i[1]
  }
})()

${files.map(file => {
    const { camelName, kebabName } = exports.fileToComponentName(prefix, file)
    return async
      ? `window.customElements.define('${kebabName}', wrap(Vue, () => import('~root/${file}')))\n`
      : (
        `import ${camelName} from '~root/${file}'\n` +
      `window.customElements.define('${kebabName}', wrap(Vue, ${camelName}))\n`
      )
  }).join('\n')}`.trim()
  fs.writeFileSync(filePath, content)
  return filePath
}
