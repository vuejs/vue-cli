// Prism don't like cjs with EMS package
// So we use ES modules for the whole file
import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'
import path from 'path'

loadLanguages()

const languages = [
  { test: /\.(html|vue|xml)$/, lang: 'markup' },
  { test: /\.js$/, lang: 'javascript' },
  { test: /\.sh$/, lang: 'bash' },
  { test: /\.coffee$/, lang: 'coffeescript' },
  { test: /\.gql$/, lang: 'graphql' },
  { test: /\.hx$/, lang: 'haxe' },
  { test: /\.md$/, lang: 'markdown' },
  { test: /\.py$/, lang: 'python' },
  { test: /\.rb$/, lang: 'ruby' },
  { test: /\.styl$/, lang: 'stylus' },
  { test: /\.ts$/, lang: 'typescript' },
  { test: /\.yml$/, lang: 'yaml' }
]

export function highlightCode (filename, content, lang = null) {
  let language
  if (lang) {
    language = { lang }
  }
  if (!language) {
    language = languages.find(l => l.test.test(filename))
  }
  if (!language) {
    const ext = path.extname(filename).substr(1)
    if (Prism.languages[ext]) {
      language = { lang: ext }
    }
  }
  // No language found
  if (!language) return content
  // Highlight code
  return Prism.highlight(content, Prism.languages[language.lang], language.lang)
}
