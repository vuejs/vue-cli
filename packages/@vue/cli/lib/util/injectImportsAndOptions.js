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
    let lastImportIndex = -1
    recast.types.visit(ast, {
      visitImportDeclaration ({ node }) {
        lastImportIndex = ast.program.body.findIndex(n => n === node)
        return false
      }
    })
    // avoid blank line after the previous import
    delete ast.program.body[lastImportIndex].loc

    const newImports = imports.map(toImport)
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
            const props = options.properties
            // inject at index length - 1 as it's usually the render fn
            options.properties = [
              ...props.slice(0, props.length - 1),
              ...([].concat(...injections.map(toProperty))),
              ...props.slice(props.length - 1)
            ]
          }
        }
        return false
      }
    })
  }

  return recast.print(ast).code
}
