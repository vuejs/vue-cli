const acorn = require('acorn')
const walk = require('acorn/dist/walk')

const ast = acorn.parse(`
module.exports = {
  lintOnSave: true,
  css: {
    loaderOptions: {
      sass: {
        data: 'foo'
      }
    }
  },
  pluginsOptions: {
    foo: 'bar'
  }
}
`)

let exportsIdentifier = null

walk.simple(ast, {
  AssignmentExpression (node) {
    if (
      node.left.type === 'MemberExpression' &&
      node.left.object.name === 'module' &&
      node.left.property.name === 'exports'
    ) {
      if (node.right.type === 'ObjectExpression') {
        augmentExports(node.right)
      } else if (node.right.type === 'Identifier') {
        // do a second pass
        exportsIdentifier = node.right.name
      }
    }
  }
})

if (exportsIdentifier) {
  walk.simple(ast, {
    VariableDeclarator (node) {
      if (
        node.id.name === exportsIdentifier &&
        node.init.type === 'ObjectExpression'
      ) {
        augmentExports(node.init)
      }
    }
  })
}

function augmentExports (node) {
  console.log(node)
}
