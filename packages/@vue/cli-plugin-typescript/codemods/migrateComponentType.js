// `shims-vue.d.ts` for Vue 3, generated by CLI 4.5.0-4.5.6, uses the following declaration:
// `component: ReturnType<typeof defineComponent>`

// So needs to update to:
// `component: DefineComponent`

module.exports = function migrateComponentType (file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  const useDoubleQuote = root.find(j.StringLiteral).some(({ node }) => node.extra.raw.startsWith('"'))

  const tsmodule = root.find(j.TSModuleDeclaration, {
    id: {
      value: '*.vue'
    }
  })

  const componentDecl = tsmodule.find(j.VariableDeclarator, {
    id: {
      name: 'component',
      typeAnnotation: {
        typeAnnotation: {
          typeName: {
            name: 'ReturnType'
          },
          typeParameters: {
            params: {
              0: {
                exprName: {
                  name: 'defineComponent'
                }
              }
            }
          }
        }
      }
    }
  })

  if (componentDecl.length !== 1) {
    return file.source
  }

  // update the component type
  componentDecl.forEach(({ node }) => {
    node.id.typeAnnotation = j.tsTypeAnnotation(
      j.tsTypeReference(
        j.identifier('DefineComponent'),
        j.tsTypeParameterInstantiation([
          j.tsTypeLiteral([]),
          j.tsTypeLiteral([]),
          j.tsUnknownKeyword()
        ])
      )
    )
  })

  // insert DefineComponent type import
  const importDeclFromVue = tsmodule.find(j.ImportDeclaration, {
    source: {
      value: 'vue'
    }
  })
  importDeclFromVue
    .get(0)
    .node.specifiers.push(j.importSpecifier(j.identifier('DefineComponent')))

  // remove defineComponent import if unused
  const defineComponentUsages = tsmodule
    .find(j.Identifier, { name: 'defineComponent' })
    .filter((identifierPath) => {
      const parent = identifierPath.parent.node

      // Ignore the import specifier
      if (
        j.ImportDefaultSpecifier.check(parent) ||
        j.ImportSpecifier.check(parent) ||
        j.ImportNamespaceSpecifier.check(parent)
      ) {
        return false
      }
    })
  if (defineComponentUsages.length === 0) {
    tsmodule
      .find(j.ImportSpecifier, {
        local: {
          name: 'defineComponent'
        }
      })
      .remove()
  }

  return root.toSource({
    lineTerminator: '\n',
    quote: useDoubleQuote ? 'double' : 'single'
  })
}

module.exports.parser = 'ts'
