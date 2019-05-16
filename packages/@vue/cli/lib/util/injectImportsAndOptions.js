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
    const toImportAST = i => j(`${i}\n`).nodes()[0].program.body[0]
    const toImportHash = node => JSON.stringify({
      specifiers: node.specifiers.map(s => s.local.name),
      source: node.source.raw
    })

    const declarations = root.find(j.ImportDeclaration)
    const importSet = new Set(declarations.nodes().map(toImportHash))
    const nonDuplicates = node => !importSet.has(toImportHash(node))

    const importASTNodes = imports.map(toImportAST).filter(nonDuplicates)

    if (declarations.length) {
      declarations
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
    const toPropertyAST = i => {
      return j(`({${i}})`).nodes()[0].program.body[0].expression.properties[0]
    }

    const properties = root
      .find(j.NewExpression, {
        callee: { name: 'Vue' },
        arguments: [{ type: 'ObjectExpression' }]
      })
      .map(path => path.get('arguments', 0))
      .get()
      .node
      .properties

    const toPropertyHash = p => `${p.key.name}: ${j(p.value).toSource()}`
    const propertySet = new Set(properties.map(toPropertyHash))
    const nonDuplicates = p => !propertySet.has(toPropertyHash(p))

    // inject at index length - 1 as it's usually the render fn
    properties.splice(-1, 0, ...injections.map(toPropertyAST).filter(nonDuplicates))
  }

  return root.toSource()
}
