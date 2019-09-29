module.exports = function (fileInfo, api) {
  const j = api.jscodeshift
  const root = j(fileInfo.source)

  root
    .find(j.Literal, { value: '@vue/app' })
    .forEach(({ node }) => {
      node.value = '@vue/cli-plugin-babel/preset'
    })
  root
    .find(j.Literal, { value: '@vue/babel-preset-app' })
    .forEach(({ node }) => {
      node.value = '@vue/cli-plugin-babel/preset'
    })

  const templateLiterals = root
    .find(j.TemplateLiteral, {
      expressions: { length: 0 }
    })

  templateLiterals
    .find(j.TemplateElement, {
      value: {
        cooked: '@vue/app'
      }
    })
    .forEach(({ node }) => {
      node.value = { cooked: '@vue/cli-plugin-babel/preset', raw: '@vue/cli-plugin-babel/preset' }
    })
  templateLiterals
    .find(j.TemplateElement, {
      value: {
        cooked: '@vue/babel-preset-app'
      }
    })
    .forEach(({ node }) => {
      node.value = { cooked: '@vue/cli-plugin-babel/preset', raw: '@vue/cli-plugin-babel/preset' }
    })

  return root.toSource()
}
