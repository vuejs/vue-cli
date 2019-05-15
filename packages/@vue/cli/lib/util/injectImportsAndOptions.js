module.exports = function injectImportsAndOptions (source, imports, injections) {
  imports = imports instanceof Set ? Array.from(imports) : imports
  injections = injections instanceof Set ? Array.from(injections) : injections

  const hasImports = imports && imports.length > 0
  const hasInjections = injections && injections.length > 0

  if (!hasImports && !hasInjections) {
    return source
  }

  const j = require('jscodeshift')

  if (hasImports) {
    const root = j(source)

    const stringToNode = i => j(`${i}\n`).nodes()[0].program.body[0]
    const nodeToHash = node => JSON.stringify({
      specifiers: node.specifiers.map(s => s.local.name),
      source: node.source.raw
    })

    const importSet = new Set()
    root.find(j.ImportDeclaration)
      .forEach(p => importSet.add(nodeToHash(p.value)))
    const nonDuplicates = node => !importSet.has(nodeToHash(node))

    const importNodes = imports.map(stringToNode).filter(nonDuplicates)

    if (importSet.size) {
      root.find(j.ImportDeclaration)
        .at(-1)
        // a tricky way to avoid blank line after the previous import
        .forEach(n => delete n.value.loc)
        .insertAfter(importNodes)
    } else {
      // no pre-existing import declarations
      const { body } = root.get().node.program
      body.unshift.apply(body, importNodes)
    }

    source = root.toSource()
  }

  const recast = require('recast')
  const ast = recast.parse(source)

  if (hasInjections) {
    const toProperty = i => {
      return recast.parse(`({${i}})`).program.body[0].expression.properties
    }
    recast.types.visit(ast, {
      visitNewExpression ({ node }) {
        if (node.callee.name === 'Vue') {
          const options = node.arguments[0]
          if (options && options.type === 'ObjectExpression') {
            const nonDuplicates = i => {
              return !options.properties.slice(0, -1).some(p => {
                return p.key.name === i[0].key.name &&
                  recast.print(p.value).code === recast.print(i[0].value).code
              })
            }
            // inject at index length - 1 as it's usually the render fn
            options.properties = [
              ...options.properties.slice(0, -1),
              ...([].concat(...injections.map(toProperty).filter(nonDuplicates))),
              ...options.properties.slice(-1)
            ]
          }
        }
        return false
      }
    })
  }

  return recast.print(ast).code
}
