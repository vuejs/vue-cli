module.exports = function injectImportsAndOptions (source, imports, injections) {
  imports = imports instanceof Set ? Array.from(imports) : imports
  injections = injections instanceof Set ? Array.from(injections) : injections

  const hasImports = imports && imports.length > 0
  const hasInjections = injections && injections.length > 0

  if (!hasImports && !hasInjections) {
    return source
  }

  const j = require('jscodeshift')
  const root = j(source)

  if (hasImports) {
    const toASTNode = i => j(`${i}\n`).nodes()[0].program.body[0]
    const toHash = importASTNode => JSON.stringify({
      specifiers: importASTNode.specifiers.map(s => s.local.name),
      source: importASTNode.source.raw
    })

    const importSet = new Set()
    root.find(j.ImportDeclaration)
      .forEach(({ node }) => importSet.add(toHash(node)))
    const nonDuplicates = node => !importSet.has(toHash(node))

    const importASTNodes = imports.map(toASTNode).filter(nonDuplicates)

    if (importSet.size) {
      root.find(j.ImportDeclaration)
        .at(-1)
        // a tricky way to avoid blank line after the previous import
        .forEach(({ node }) => delete node.loc)
        .insertAfter(importASTNodes)
    } else {
      // no pre-existing import declarations
      root.get().node.program.body.unshift(...importASTNodes)
    }
  }

  if (hasInjections) {
    const toProperty = i => {
      return j(`({${i}})`).nodes()[0].program.body[0].expression.properties
    }

    root
      .find(j.NewExpression, {
        callee: { name: 'Vue' }
      })
      .forEach(({ node }) => {
        const options = node.arguments[0]
        if (options && options.type === 'ObjectExpression') {
          const nonDuplicates = i => {
            return !options.properties.slice(0, -1).some(p => {
              return p.key.name === i[0].key.name &&
                j(p.value).toSource() === j(i[0].value).toSource()
            })
          }
          // inject at index length - 1 as it's usually the render fn
          options.properties = [
            ...options.properties.slice(0, -1),
            ...([].concat(...injections.map(toProperty).filter(nonDuplicates))),
            ...options.properties.slice(-1)
          ]
        }
      })
  }

  return root.toSource()
}
