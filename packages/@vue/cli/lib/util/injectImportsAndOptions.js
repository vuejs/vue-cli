module.exports = function injectImportsAndOptions (source, imports, injections) {
  imports = imports instanceof Set ? Array.from(imports) : imports
  injections = injections instanceof Set ? Array.from(injections) : injections

  const hasImports = imports && imports.length > 0
  const hasInjections = injections && injections.length > 0

  if (!hasImports && !hasInjections) {
    return source
  }

  const recast = require('recast')
  const ast = recast.parse(source)

  if (hasImports) {
    const toImport = i => recast.parse(`${i}\n`).program.body[0]
    const importDeclarations = []
    let lastImportIndex = -1

    recast.types.visit(ast, {
      visitImportDeclaration ({ node }) {
        lastImportIndex = ast.program.body.findIndex(n => n === node)
        importDeclarations.push(node)
        return false
      }
    })
    // avoid blank line after the previous import
    if (lastImportIndex !== -1) {
      delete ast.program.body[lastImportIndex].loc
    }

    const nonDuplicates = i => {
      return !importDeclarations.some(node => {
        const result = node.source.raw === i.source.raw && node.specifiers.length === i.specifiers.length

        return result && node.specifiers.every((item, index) => {
          return i.specifiers[index].local.name === item.local.name
        })
      })
    }

    const newImports = imports.map(toImport).filter(nonDuplicates)
    ast.program.body.splice(lastImportIndex + 1, 0, ...newImports)
  }

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
